import {
    PropertyValidationResult,
    ReprOptions,
    ScalarDefinition,
    Schema,
    SchemaValidationResult,
} from "./interfaces.js";
import { ReprDefinitions, repr, typeRepr } from "./repr.js";
import validateNullable from "./validate-nullable.js";
import validateScalar from "./validate-scalar.js";

export default function validateSchema(
    obj: object,
    schema: Schema,
    options: ReprOptions,
): SchemaValidationResult {
    const errors: PropertyValidationResult[] = [];
    for (const { name: key, definition } of schema.definitions) {
        if (definition.type._tildaEntityType === "scalar") {
            const misuse = validateScalar(
                obj,
                key,
                definition as ScalarDefinition,
                options,
            );
            if (misuse) {
                errors.push({
                    name: key,
                    ...misuse,
                });
            }
            continue;
        }

        const propR = repr(obj, key, options);
        const { type, ...nullableOptions } = definition;

        const valNull = validateNullable(obj, key, nullableOptions, options);
        if (valNull) {
            errors.push({
                name: key,
                ...valNull,
            });
            continue;
        }

        if (propR !== ReprDefinitions.OBJECT) {
            errors.push({
                name: key,
                expected: typeRepr(definition, options),
                found: propR,
            });
            continue;
        }

        if (type._tildaEntityType === "schema") {
            const validationResult = validateSchema(
                obj[key as keyof object],
                type,
                options,
            );
            if (validationResult.errors) {
                errors.push({
                    name: key,
                    expected: typeRepr(definition, options),
                    found: ReprDefinitions.OBJECT,
                    subproperties: validationResult.errors,
                });
            }
            continue;
        }
        // if (definition.type._tildaEntityType === "array") {
        // }
    }

    const objKeys = Object.keys(obj);
    const schemaKeys = schema.definitions.map(def => def.name);
    const redundantKeys = objKeys.filter(key => !schemaKeys.includes(key));

    for (const key of redundantKeys) {
        if (
            obj[key as keyof object] === undefined &&
            !options.hasPropertyCheck
        ) {
            continue;
        }
        const propR = repr(obj, key, options);
        errors.push({
            name: key,
            expected: options.hasPropertyCheck
                ? ReprDefinitions.NO_PROPERTY
                : ReprDefinitions.UNDEFINED,
            found: propR,
        });
    }

    return { errors: errors.length ? errors : null };
}
