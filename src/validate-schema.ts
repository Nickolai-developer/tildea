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

    const array = obj[key as keyof object] as Array<unknown>;
    if (!(array instanceof Array)) {
        return commonError();
    }

    if (type._tildaEntityType === "array") {
        const subproperties: PropertyValidationResult[] = [];
        const arrKeys: string[] = [];
        for (let i = 0; i < array.length; i++) {
            const arrKey = "" + i;
            arrKeys.push(arrKey);
            const error = validateProperty(
                array,
                arrKey,
                type.elemDefinition,
                options,
            );
            error && subproperties.push(error);
        }
        const redtErrs = redundantPropsErrors(array, arrKeys, options);
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
        const subproperties: PropertyValidationResult[] = [];
        const maxindex = Math.max(array.length, type.types.length);
        let i = 0;
        for (; i < maxindex; i++) {
            const elemType = type.types[i];
            if (!elemType) {
                break;
            }
            const error = validateProperty(array, "" + i, elemType, options);
            error && subproperties.push(error);
        }
        for (; i < maxindex; i++) {
            const arrKey = "" + i;
            subproperties.push({
                name: arrKey,
                expected: options.hasPropertyCheck
                    ? ReprDefinitions.NO_PROPERTY
                    : ReprDefinitions.UNDEFINED,
                found: repr(array, arrKey),
            });
        }
        return subproperties.length
            ? { ...commonError(), subproperties }
            : null;
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
