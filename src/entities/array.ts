import { usedReprOpts } from "../config.js";
import {
    PropertyValidationStreamableMessage,
    TypeEntity,
    TypeRepresentation,
} from "../interfaces.js";
import { ReprDefinitions, repr } from "../validation/repr.js";
import ExactTypeEntity, { EntityInput, ExecutionContext } from "./entity.js";

interface ArrayInput extends EntityInput {
    elemType: TypeEntity;
}

export default class ArrayType extends ExactTypeEntity {
    override readonly entity = "ARRAY";
    private _elemType: TypeEntity;
    public get elemType(): TypeEntity {
        return this._elemType;
    }

    constructor({ elemType, ...entityInput }: ArrayInput) {
        super(entityInput);
        this._elemType = elemType;
    }

    protected override copy(): this {
        return new ArrayType(this) as this;
    }

    public override get repr(): TypeRepresentation {
        if (!this._repr) {
            const nullableStr = super.repr;
            const elem =
                typeof this._elemType === "string"
                    ? this._elemType
                    : this._elemType.repr;
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
        depMap,
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

        const nullCheck = this.checkNulls({ obj, key, currentDepth });
        if (nullCheck !== undefined) {
            if (nullCheck !== null) {
                yield nullCheck;
            }
            return;
        }

        const contextDependencies = this.applyContextDependencies(depMap);
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
            const elemType = this.pickDependency(
                this._elemType,
                contextDependencies,
            );
            arrKeys.push(arrKey);
            const errors = elemType.execute({
                obj: array,
                key: arrKey,
                currentDepth: currentDepth + 1,
                depMap: contextDependencies,
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
