import {
    Definition,
    PropertyValidationResult,
    ReprOptions,
    ScalarDefinition,
    Schema,
    SchemaValidationResult,
} from "./interfaces.js";
import { ReprDefinitions, repr, typeRepr } from "./repr.js";
import validateNullable from "./validate-nullable.js";
import validateScalar from "./validate-scalar.js";

const validateProperty = (
    obj: object,
    key: string,
    definition: Definition,
    options: ReprOptions,
): PropertyValidationResult | null => {
    if (definition.type._tildaEntityType === "scalar") {
        const misuse = validateScalar(
            obj,
            key,
            definition as ScalarDefinition,
            options,
        );

        return misuse
            ? {
                  name: key,
                  ...misuse,
              }
            : null;
    }

    const propR = repr(obj, key, options);
    const { type, ...nullableOptions } = definition;
    const commonError = () => ({
        name: key,
        expected: typeRepr(definition, options),
        found: propR,
    });

    const valNull = validateNullable(obj, key, nullableOptions, options);
    if (valNull) {
        return {
            name: key,
            ...valNull,
        };
    }

    if (propR !== ReprDefinitions.OBJECT) {
        return commonError();
    }

    if (type._tildaEntityType === "schema") {
        const { errors: subproperties } = validateSchema(
            obj[key as keyof object],
            type,
            options,
        );
        return subproperties
            ? {
                  ...commonError(),
                  subproperties,
              }
            : null;
    }
    if (type._tildaEntityType === "array") {
        const arr = obj[key as keyof object] as Array<unknown>;
        if (!(arr instanceof Array)) {
            return commonError();
        }
        const subproperties: PropertyValidationResult[] = [];
        for (let i = 0; i < arr.length; i++) {
            const error = validateProperty(
                arr,
                "" + i,
                type.elemDefinition,
                options,
            );
            if (error) {
                subproperties.push(error);
            }
        }
        return subproperties.length
            ? {
                  ...commonError(),
                  subproperties,
              }
            : null;
    }
    throw new Error("Not implemented~");
};

export default function validateSchema(
    obj: object,
    schema: Schema,
    options: ReprOptions,
): SchemaValidationResult {
    const errors: PropertyValidationResult[] = [];
    for (const { name: key, definition } of schema.definitions) {
        const error = validateProperty(obj, key, definition, options);
        if (error) {
            errors.push(error);
        }
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
