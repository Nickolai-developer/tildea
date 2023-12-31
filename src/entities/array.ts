import { CompleteDefinition } from "../interfaces.js";
import ExactTypeEntity from "./entity.js";

interface ArrayInput {
    elemDefinition: CompleteDefinition;
}

export default class ArrayType extends ExactTypeEntity {
    override readonly entity = "ARRAY";
    elemDefinition: CompleteDefinition;

    constructor({ elemDefinition }: ArrayInput) {
        super();
        this.elemDefinition = elemDefinition;
    }
}
