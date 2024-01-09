import { usedReprOpts } from "../config.js";
import { TildaSchemaBuildingError } from "../errors.js";
import type { TypeRepresentation } from "../index.js";
import { repr } from "../utils.js";
import {
    ExactTypeEntity,
    type EntityInput,
    type ExecutionContext,
} from "./entity.js";

interface ScalarInput extends EntityInput {
    validate: (v: unknown) => boolean;
    name: string;
}

export class ScalarType extends ExactTypeEntity {
    override readonly entity = "SCALAR";
    validate: (v: unknown) => boolean;
    name: string;

    constructor({ name, validate, ...entityInput }: ScalarInput) {
        super(entityInput);
        this.name = name;
        this.validate = validate;
    }

    protected override copy(): this {
        return new ScalarType({
            name: this.name,
            validate: this.validate,
            declDeps: this.declDeps,
            usedDeps: this.usedDeps,
            nullable: this.nullable,
        }) as this;
    }

    public override get repr(): TypeRepresentation {
        if (!this._repr) {
            const nullableStr = super.repr;
            return this.joinTypeParts(this.name, nullableStr);
        }
        return this._repr;
    }

    public override *execute({ obj, key, currentDepth }: ExecutionContext) {
        const nullCheck = this.checkNulls({ obj, key, currentDepth });
        if (nullCheck !== undefined) {
            if (nullCheck !== null) {
                yield nullCheck;
            }
            return;
        }

        const scalar = obj[key as keyof object];

        if (scalar === null || scalar === undefined) {
            return;
        }
        if (!this.validate(scalar)) {
            yield {
                name: key,
                expected: this.repr,
                found: repr(scalar, usedReprOpts),
                depth: currentDepth,
            };
        }
    }

    public override declare(): never {
        throw new TildaSchemaBuildingError(
            "Can't call .declare on scalar type since it can't have dependencies.",
        );
    }

    public override use(): never {
        throw new TildaSchemaBuildingError(
            "Can't call .use on scalar type since it can't have dependencies.",
        );
    }
}
