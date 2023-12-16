import {
    Definition,
    PropertyValidationResult,
    ReprOptions,
    ScalarDefinition,
    Schema,
    SchemaValidationResult,
    TypeMisuseResult,
} from "./interfaces.js";
import { ReprDefinitions, repr, typeRepr } from "./repr.js";
import validateNullable from "./validate-nullable.js";
import validateScalar from "./validate-scalar.js";

interface PropertyValidationSubResult extends TypeMisuseResult {
    name: string;
    depth: number;
}

function* validateProperty(
    obj: object,
    key: string,
    definition: Definition,
    options: ReprOptions,
    currentDepth: number,
): Generator<PropertyValidationSubResult, void, void> {
    if (definition.type._tildaEntityType === "scalar") {
        const misuse = validateScalar(
            obj,
            key,
            definition as ScalarDefinition,
            options,
        );

        if (misuse) {
            yield {
                name: key,
                depth: currentDepth,
                ...misuse,
            };
        }
        return;
    }

    const propR = repr(obj, key, options);
    const { type, ...nullableOptions } = definition;

    const valNull = validateNullable(obj, key, nullableOptions, options);
    if (valNull) {
        yield {
            name: key,
            depth: currentDepth,
            ...valNull,
        };
        return;
    }

    const commonError = () => ({
        name: key,
        depth: currentDepth,
        expected: typeRepr(definition, options),
        found: propR,
    });

    if (propR !== ReprDefinitions.OBJECT) {
        yield commonError();
        return;
    }

    if (type._tildaEntityType === "schema") {
        const errors = executeSchema(
            obj[key as keyof object],
            type,
            options,
            currentDepth + 1,
        );
        const error = errors.next().value;
        if (error) {
            yield commonError();
            yield error;
            yield* errors;
        }
        return;
    }

    const array = obj[key as keyof object] as Array<unknown>;
    if (!(array instanceof Array)) {
        yield commonError();
        return;
    }

    const arrKeys: string[] = [];
    const propErrors: Generator<PropertyValidationSubResult, void, void>[] = [];

    if (
        type._tildaEntityType === "array" ||
        type._tildaEntityType === "staticArray"
    ) {
        const isArray = type._tildaEntityType === "array";
        for (let i = 0; i < array.length; i++) {
            const arrKey = "" + i;
            arrKeys.push(arrKey);
            const errors = validateProperty(
                array,
                arrKey,
                isArray ? type.elemDefinition : type.types[i],
                options,
                currentDepth + 1,
            );
            propErrors.push(errors);
        }
        propErrors.push(
            redundantPropsErrors(array, arrKeys, options, currentDepth + 1),
        );

        let commonErrorWasEjected = false;
        for (const errors of propErrors) {
            if (commonErrorWasEjected) {
                yield* errors;
            } else {
                for (const error of errors) {
                    commonErrorWasEjected = true;
                    yield commonError();
                    yield error;
                    yield* errors;
                }
            }
        }
        return;
    }

    throw new Error("Not implemented~");
}

function* redundantPropsErrors(
    obj: object,
    objectOwnKeys: string[],
    options: ReprOptions,
    currentDepth: number,
): Generator<PropertyValidationSubResult, void, void> {
    const objKeys = Object.keys(obj);
    const redundantKeys = objKeys.filter(key => !objectOwnKeys.includes(key));

    for (const key of redundantKeys) {
        if (
            obj[key as keyof object] === undefined &&
            !options.hasPropertyCheck
        ) {
            continue;
        }
        yield {
            name: key,
            depth: currentDepth,
            expected: options.hasPropertyCheck
                ? ReprDefinitions.NO_PROPERTY
                : ReprDefinitions.UNDEFINED,
            found: repr(obj, key, options),
        };
    }
}

function* executeSchema(
    obj: object,
    schema: Schema,
    options: ReprOptions,
    currentDepth: number,
): Generator<PropertyValidationSubResult, void, void> {
    for (const { name, definition } of schema.definitions) {
        yield* validateProperty(obj, name, definition, options, currentDepth);
    }

    yield* redundantPropsErrors(
        obj,
        schema.definitions.map(def => def.name),
        options,
        currentDepth,
    );
}

export default function validateSchema(
    obj: object,
    schema: Schema,
    options: ReprOptions,
): SchemaValidationResult {
    const errors: PropertyValidationResult[] = [];

    const stack: PropertyValidationResult[][] = [];
    let currentDepth = 0;
    let currentFacility = errors;

    const pickFacility = (newDepth: number): void => {
        if (newDepth === currentDepth) {
            return;
        }
        if (newDepth > currentDepth) {
            currentDepth++;
            stack.push(currentFacility);
            const last = currentFacility[currentFacility.length - 1];
            if (!last.subproperties) {
                last.subproperties = [];
            }
            currentFacility = last.subproperties!;
        } else {
            currentDepth--;
            currentFacility = stack.pop()!;
        }
    };

    for (const { depth, ...result } of executeSchema(obj, schema, options, 0)) {
        pickFacility(depth);
        currentFacility.push(result);
    }

    return { errors: errors.length ? errors : null };
}
