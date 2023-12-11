interface TildaInput {
    validate: (v: unknown) => boolean;
    name: string;
}

class TildaScalarType {
    readonly _tildaEntityType = "scalar";
    readonly validate: (v: unknown) => boolean;
    readonly name: string;

    constructor({ validate, name }: TildaInput) {
        this.validate = validate;
        this.name = name;
    }
}

export default TildaScalarType;
