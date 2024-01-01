import {
    CompleteDefinition,
    ReprOptions,
    ScalarDefinition,
    TypeRepresentation,
} from "../interfaces.js";
import validateScalar from "../validation/validate-scalar.js";
import ExactTypeEntity, { EntityInput } from "./entity.js";

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

    public override repr(options: ReprOptions): TypeRepresentation {
        const nullableStr = super.repr(options);
        return this.joinTypeParts(this.name, nullableStr);
    }

    public override *execute(
        obj: object,
        key: string,
        definition: CompleteDefinition,
        options: ReprOptions,
        currentDepth: number,
    ) {
        const misuse = validateScalar(
            obj,
            key,
            definition as ScalarDefinition,
            options,
        );

        if (misuse) {
            yield {
                name: key,
                depth: currentDepth,
                ...misuse,
            };
        }
    }
}
