import { CompleteDefinition } from "../interfaces.js";
import ExactTypeEntity from "./entity.js";

interface SchemaInput {
    name: string;
    definitions: SchemaProperty[];
}

interface SchemaProperty {
    name: string;
    definition: CompleteDefinition;
}

export default class Schema extends ExactTypeEntity {
    override readonly entity = "SCHEMA";
    name: string;
    definitions: SchemaProperty[];
    constructor({ definitions, name }: SchemaInput) {
        super();
        this.definitions = definitions;
        this.name = name;
    }
}
