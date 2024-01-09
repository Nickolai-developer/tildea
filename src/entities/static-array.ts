import { usedReprOpts } from "../config.js";
import type {
    PropertyValidationStreamableMessage,
    TypeEntity,
    TypeRepresentation,
} from "../index.js";
import { ReprDefinitions, repr } from "../utils.js";
import {
    ExactTypeEntity,
    type EntityInput,
    type ExecutionContext,
} from "./entity.js";

interface StaticArrayInput extends EntityInput {
    name?: string;
    types: TypeEntity[];
}

export class StaticArrayType extends ExactTypeEntity {
    override readonly entity = "STATIC";
    name?: string;
    private _types: TypeEntity[];
    get types(): TypeEntity[] {
        return [...this._types];
    }

    constructor({ types, name, ...entityInput }: StaticArrayInput) {
        super(entityInput);
        this.name = name;
        this._types = types;
    }

    protected override copy(): this {
        return new StaticArrayType({
            types: this.types,
            name: this.name,
            declDeps: this.declDeps,
            usedDeps: this.usedDeps,
            nullable: this.nullable,
        }) as this;
    }

    public override get repr(): TypeRepresentation {
        if (!this._repr) {
            const nullableStr = super.repr;
            return this.joinTypeParts(
                this.name ||
                    `[${this._types
                        .map(t => (typeof t === "string" ? t : t.repr))
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

        const maxindex = Math.max(array.length, this._types.length);
        for (let i = 0; i < maxindex; i++) {
            const arrKey = "" + i;
            const elemTypeIndex = this._types[i];
            if (!elemTypeIndex) {
                break;
            }
            arrKeys.push(arrKey);
            const elemType = this.pickDependency(
                elemTypeIndex,
                contextDependencies,
            );
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
