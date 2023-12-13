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
        const arrKeys: string[] = [];
        for (let i = 0; i < arr.length; i++) {
            const arrKey = "" + i;
            arrKeys.push(arrKey);
            const error = validateProperty(
                arr,
                arrKey,
                type.elemDefinition,
                options,
            );
            error && subproperties.push(error);
        }
        const redtErrs = redundantPropsErrors(arr, arrKeys, options);
        return subproperties.length
            ? {
                  ...commonError(),
                  subproperties: redtErrs
                      ? subproperties.concat(redtErrs)
                      : subproperties,
              }
            : null;
    }
    if (type._tildaEntityType === "staticArray") {
        const arr = obj[key as keyof object] as Array<unknown>;
        if (!(arr instanceof Array)) {
            return commonError();
        }
        const subproperties: PropertyValidationResult[] = [];
        const maxindex = Math.max(arr.length, type.types.length);
        for (let i = 0; i < maxindex; i++) {}
    }
    throw new Error("Not implemented~");
};

const redundantPropsErrors = (
    obj: object,
    schemaKeys: string[],
    options: ReprOptions,
): PropertyValidationResult[] | null => {
    const errors: PropertyValidationResult[] = [];

    const objKeys = Object.keys(obj);
    const redundantKeys = objKeys.filter(key => !schemaKeys.includes(key));

    for (const key of redundantKeys) {
        if (
            obj[key as keyof object] === undefined &&
            !options.hasPropertyCheck
        ) {
            continue;
        }
        errors.push({
            name: key,
            expected: options.hasPropertyCheck
                ? ReprDefinitions.NO_PROPERTY
                : ReprDefinitions.UNDEFINED,
            found: repr(obj, key, options),
        });
    }

    return errors.length ? errors : null;
};

export default function validateSchema(
    obj: object,
    schema: Schema,
    options: ReprOptions,
): SchemaValidationResult {
    const errors: (PropertyValidationResult | PropertyValidationResult[])[] =
        [];
    for (const { name, definition } of schema.definitions) {
        const error = validateProperty(obj, name, definition, options);
        error && errors.push(error);
    }

    const redtErrs = redundantPropsErrors(
        obj,
        schema.definitions.map(def => def.name),
        options,
    );
    redtErrs && errors.push(redtErrs);

    return { errors: errors.length ? errors.flat() : null };
}
