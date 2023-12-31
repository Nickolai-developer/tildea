import {
    CompleteDefinition,
    ReprOptions,
    ScalarDefinition,
} from "../interfaces.js";
import validateScalar from "../validation/validate-scalar.js";
import ExactTypeEntity from "./entity.js";

interface ScalarInput {
    validate: (v: unknown) => boolean;
    name: string;
}

export default class ScalarType extends ExactTypeEntity {
    override readonly entity = "SCALAR";
    validate: (v: unknown) => boolean;
    name: string;

    constructor({ name, validate }: ScalarInput) {
        super();
        this.name = name;
        this.validate = validate;
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
