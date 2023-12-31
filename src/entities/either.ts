import ExactTypeEntity from "./entity.js";

interface EitherInput {
    name?: string;
    types: ExactTypeEntity[];
}

export default class EitherType extends ExactTypeEntity {
    override readonly entity = "EITHER";
    name?: string;
    types: ExactTypeEntity[];

    constructor({ types, name }: EitherInput) {
        super();
        this.name = name;
        this.types = types;
    }
}
