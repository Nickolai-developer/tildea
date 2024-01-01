import {
    PropertyValidationStreamableMessage,
    ReprOptions,
    TypeRepresentation,
} from "../interfaces.js";
import { ReprDefinitions, repr } from "../validation/repr.js";
import ExactTypeEntity, { EntityInput, TERMINATE_EXECUTION } from "./entity.js";

interface ArrayInput extends EntityInput {
    elemType: ExactTypeEntity;
}

export default class ArrayType extends ExactTypeEntity {
    override readonly entity = "ARRAY";
    elemType: ExactTypeEntity;

    constructor({ elemType, ...entityInput }: ArrayInput) {
        super(entityInput);
        this.elemType = elemType;
    }

    public override repr(options: ReprOptions): TypeRepresentation {
        const nullableStr = super.repr(options);
        const elem = this.elemType.repr(options);
        return (
            [
                `${
                    elem.includes(ReprDefinitions.DELIM_OR)
                        ? this.encase(elem)
                        : elem
                }[]`,
                nullableStr,
            ].filter(s => s) as string[]
        ).join(ReprDefinitions.DELIM_OR);
    }

    public override *execute(
        obj: object,
        key: string,
        type: ArrayType,
        options: ReprOptions,
        currentDepth: number,
    ): Generator<PropertyValidationStreamableMessage, void, void> {
        const propR = repr(obj, key, options);
        const commonError: PropertyValidationStreamableMessage = {
            name: key,
            depth: currentDepth,
            expected: type.repr(options),
            found: propR,
        };

        const nullCheck: PropertyValidationStreamableMessage | string | void =
            this.checkNulls(obj, key, type, options, currentDepth).next().value;
        if (nullCheck === TERMINATE_EXECUTION) {
            return;
        }
        if (typeof nullCheck === "object") {
            yield nullCheck;
            return;
        }

        const array = obj[key as keyof object] as Array<unknown>;
        if (!(array instanceof Array)) {
            yield commonError;
            return;
        }

        const arrKeys: string[] = [];
        const propErrors: Generator<
            PropertyValidationStreamableMessage,
            void,
            void
        >[] = [];

        for (let i = 0; i < array.length; i++) {
            const arrKey = "" + i;
            const elemType = (type as ArrayType).elemType;
            if (!elemType) {
                break;
            }
            arrKeys.push(arrKey);
            const errors = elemType.execute(
                array,
                arrKey,
                elemType,
                options,
                currentDepth + 1,
            );
            propErrors.push(errors);
        }
        propErrors.push(
            this.redundantPropsErrors(
                array,
                arrKeys,
                options,
                currentDepth + 1,
            ),
        );

        // ejects common error followed by errors only if there's errors in pools
        let commonErrorWasEjected = false;
        for (const errors of propErrors) {
            if (commonErrorWasEjected) {
                yield* errors;
            } else {
                for (const error of errors) {
                    commonErrorWasEjected = true;
                    yield commonError;
                    yield error;
                    yield* errors;
                }
            }
        }
    }
}
