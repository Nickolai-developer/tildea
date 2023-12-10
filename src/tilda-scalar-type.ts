interface TildaInput {
    validate: (v: unknown) => boolean;
    repr: string;
}

class TildaScalarType {
    readonly validate: (v: unknown) => boolean;
    readonly repr: string;

    constructor({ validate, repr }: TildaInput) {
        this.validate = validate;
        this.repr = repr;
    }
}

export default TildaScalarType;
