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

    public override get repr(): TypeRepresentation {
        if (!this._repr) {
            const nullableStr = super.repr;
            const elem = this.elemType.repr;
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

        for (let i = 0; i < array.length; i++) {
            const arrKey = "" + i;
            const elemType = this.elemType;
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
