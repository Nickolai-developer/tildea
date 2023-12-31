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
}
