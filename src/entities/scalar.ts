import { usedReprOpts } from "../config.js";
import { TypeRepresentation } from "../interfaces.js";
import { repr } from "../validation/repr.js";
import ExactTypeEntity, { EntityInput, ExecutionContext } from "./entity.js";

interface ScalarInput extends EntityInput {
    validate: (v: unknown) => boolean;
    name: string;
}

export default class ScalarType extends ExactTypeEntity {
    override readonly entity = "SCALAR";
    validate: (v: unknown) => boolean;
    name: string;

    constructor({ name, validate, ...entityInput }: ScalarInput) {
        super(entityInput);
        this.name = name;
        this.validate = validate;
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
}
