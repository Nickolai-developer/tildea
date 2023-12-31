import { CompleteDefinition } from "../interfaces.js";
import ExactTypeEntity from "./entity.js";

interface StaticArrayInput {
    name?: string;
    types: CompleteDefinition[];
}

export default class StaticArrayType extends ExactTypeEntity {
    override readonly entity = "STATIC";
    name?: string;
    types: CompleteDefinition[];

    constructor({ types, name }: StaticArrayInput) {
        super();
        this.name = name;
        this.types = types;
    }
}
