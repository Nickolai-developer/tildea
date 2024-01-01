import { usedReprOpts } from "../config.js";
import {
    PropertyValidationStreamableMessage,
    TypeRepresentation,
} from "../interfaces.js";
import { ReprDefinitions, repr } from "../validation/repr.js";
import ExactTypeEntity, {
    EntityInput,
    ExecutionContext,
    TERMINATE_EXECUTION,
} from "./entity.js";

interface StaticArrayInput extends EntityInput {
    name?: string;
    types: ExactTypeEntity[];
}

export default class StaticArrayType extends ExactTypeEntity {
    override readonly entity = "STATIC";
    name?: string;
    types: ExactTypeEntity[];

    constructor({ types, name, ...entityInput }: StaticArrayInput) {
        super(entityInput);
        this.name = name;
        this.types = types;
    }

    public override get repr(): TypeRepresentation {
        if (!this._repr) {
            const nullableStr = super.repr;
            return this.joinTypeParts(
                this.name ||
                    `[${this.types
                        .map(t => t.repr)
                        .join(ReprDefinitions.DELIM_COLON)}]`,
                nullableStr,
            );
        }
        return this._repr;
    }

    public override *execute({
        obj,
        key,
        currentDepth,
    }: ExecutionContext): Generator<
        PropertyValidationStreamableMessage,
        void,
        void
    > {
        const propR = repr(obj, key, usedReprOpts);
        const commonError: PropertyValidationStreamableMessage = {
            name: key,
            depth: currentDepth,
            expected: this.repr,
            found: propR,
        };

        const nullCheck: PropertyValidationStreamableMessage | string | void =
            this.checkNulls({ obj, key, currentDepth }).next().value;
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

        const maxindex = Math.max(array.length, this.types.length);
        for (let i = 0; i < maxindex; i++) {
            const arrKey = "" + i;
            const elemType = this.types[i];
            if (!elemType) {
                break;
            }
            arrKeys.push(arrKey);
            const errors = elemType.execute({
                obj: array,
                key: arrKey,
                currentDepth: currentDepth + 1,
            });
            propErrors.push(errors);
        }
        propErrors.push(
            this.redundantPropsErrors(array, arrKeys, currentDepth + 1),
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
