import {
    CompleteDefinition,
    PropertyValidationStreamableMessage,
    ReprOptions,
    SchemaDefinition,
} from "../interfaces.js";
import { ReprDefinitions, repr, typeRepr } from "../validation/repr.js";
import ExactTypeEntity, { TERMINATE_EXECUTION } from "./entity.js";

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

    public override *execute(
        obj: object,
        key: string,
        def: SchemaDefinition,
        options: ReprOptions,
        currentDepth: number,
    ) {
        const propR = repr(obj, key, options);
        const commonError: PropertyValidationStreamableMessage = {
            name: key,
            depth: currentDepth,
            expected: typeRepr(def, options),
            found: propR,
        };

        if (propR !== ReprDefinitions.OBJECT) {
            yield commonError;
            return;
        }

        const nullCheck: PropertyValidationStreamableMessage | string | void =
            this.checkNulls(obj, key, def, options, currentDepth).next().value;
        if (nullCheck === TERMINATE_EXECUTION) {
            return;
        }
        if (typeof nullCheck === "object") {
            yield nullCheck;
            return;
        }

        const propErrors: Generator<
            PropertyValidationStreamableMessage,
            void,
            void
        >[] = [];
        const obj_ = obj[key as keyof object];
        for (const { name, definition } of def.type.definitions) {
            propErrors.push(
                definition.type.execute(
                    obj_,
                    name,
                    definition,
                    options,
                    currentDepth + 1,
                ),
            );
        }

        propErrors.push(
            this.redundantPropsErrors(
                obj_,
                def.type.definitions.map(def => def.name),
                options,
                currentDepth + 1,
            ),
        );

        let commonErrorWasEjected = false;
        for (const errors of propErrors) {
            if (commonErrorWasEjected) {
                yield* errors;
            } else {
                for (const error of errors) {
                    commonErrorWasEjected = true;
                    yield commonError;
                    yield error;
                    yield* errors;
                }
            }
        }
    }
}
