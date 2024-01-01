import {
    CompleteDefinition,
    PropertyValidationStreamableMessage,
    ReprOptions,
    TypeRepresentation,
} from "../interfaces.js";
import { ReprDefinitions, repr } from "../validation/repr.js";
import ExactTypeEntity, { EntityInput, TERMINATE_EXECUTION } from "./entity.js";

interface ArrayInput extends EntityInput {
    elemDefinition: CompleteDefinition;
}

export default class ArrayType extends ExactTypeEntity {
    override readonly entity = "ARRAY";
    elemDefinition: CompleteDefinition;

    constructor({ elemDefinition, ...entityInput }: ArrayInput) {
        super(entityInput);
        this.elemDefinition = elemDefinition;
    }

    public override repr(options: ReprOptions): TypeRepresentation {
        const nullableStr = super.repr(options);
        const elem = this.elemDefinition.type.repr(options);
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
        def: CompleteDefinition,
        options: ReprOptions,
        currentDepth: number,
    ): Generator<PropertyValidationStreamableMessage, void, void> {
        const propR = repr(obj, key, options);
        const commonError: PropertyValidationStreamableMessage = {
            name: key,
            depth: currentDepth,
            expected: def.type.repr(options),
            found: propR,
        };

        const nullCheck: PropertyValidationStreamableMessage | string | void =
            this.checkNulls(obj, key, def, options, currentDepth).next().value;
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
            const elemType = (def.type as ArrayType).elemDefinition;
            if (!elemType) {
                break;
            }
            arrKeys.push(arrKey);
            const errors = elemType.type.execute(
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
