import {
    CompleteDefinition,
    PropertyValidationStreamableMessage,
    ReprOptions,
    TypeRepresentation,
} from "../interfaces.js";
import { ReprDefinitions, repr } from "../validation/repr.js";
import ExactTypeEntity, { EntityInput, TERMINATE_EXECUTION } from "./entity.js";

interface StaticArrayInput extends EntityInput {
    name?: string;
    types: CompleteDefinition[];
}

export default class StaticArrayType extends ExactTypeEntity {
    override readonly entity = "STATIC";
    name?: string;
    types: CompleteDefinition[];

    constructor({ types, name, ...entityInput }: StaticArrayInput) {
        super(entityInput);
        this.name = name;
        this.types = types;
    }

    public override repr(options: ReprOptions): TypeRepresentation {
        const nullableStr = super.repr(options);
        return this.joinTypeParts(
            this.name ||
                `[${this.types
                    .map(t => t.type.repr(options))
                    .join(ReprDefinitions.DELIM_COLON)}]`,
            nullableStr,
        );
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

        const maxindex = Math.max(
            array.length,
            (def.type as StaticArrayType).types.length,
        );
        for (let i = 0; i < maxindex; i++) {
            const arrKey = "" + i;
            const elemType = (def.type as StaticArrayType).types[i];
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
