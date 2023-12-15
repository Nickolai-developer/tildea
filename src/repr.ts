import {
    Definition,
    EitherTypeDefinition,
    NullableOptions,
    ReprOptions,
    TildaDefinitionEntity,
    TypeStringRepresentation,
} from "./interfaces.js";

export enum ReprDefinitions {
    DELIM_OR = " | ",
    DELIM_COLON = ", ",
    NO_PROPERTY = "<no-property>",
    UNDEFINED = "undefined",
    NULL = "null",
    NAN = "<NaN>",
    OBJECT = "<object>",
}

export function repr(
    val: any,
    options?: Omit<ReprOptions, "hasPropertyCheck">,
): TypeStringRepresentation;
export function repr(
    obj: object,
    propertyName: string,
    options?: ReprOptions,
): TypeStringRepresentation;
export function repr(
    valOrObj: any,
    propOrOptions?: string | ReprOptions,
    opts?: ReprOptions,
): TypeStringRepresentation {
    let val, obj, property: string, options: ReprOptions;
    if (typeof propOrOptions === "string") {
        property = propOrOptions;
        obj = valOrObj;
        options = opts || {};
        return obj.hasOwnProperty(property)
            ? repr(obj[property], options)
            : options.hasPropertyCheck
            ? ReprDefinitions.NO_PROPERTY
            : ReprDefinitions.UNDEFINED;
    } else {
        val = valOrObj;
        options = propOrOptions || {};
        if (
            options.useValue &&
            ["bigint", "number", "string", "boolean"].includes(typeof val)
        ) {
            const isstr = typeof val === "string";
            return (isstr ? '"' : "") + val + (isstr ? '"' : "");
        }
        switch (typeof val) {
            case "object":
                return val ? ReprDefinitions.OBJECT : ReprDefinitions.NULL;
            case "undefined":
                return ReprDefinitions.UNDEFINED;
            case "bigint":
            case "boolean":
            case "number":
            case "string":
                return typeof val;
            default:
                throw new Error(`Repr error: ${typeof val} isn't allowed.`);
        }
    }
}

const joinTypeParts = (
    ...args: (string | false | null | undefined)[]
): string => args.filter(s => s).join(ReprDefinitions.DELIM_OR);

const encase = (type: string): string =>
    type.startsWith("(") && type.endsWith(")") ? type : `(${type})`;

const defaultNullableOptions: NullableOptions = {
    defined: true,
    nullable: false,
    optional: false,
};

const mergeNullable = (
    { defined, nullable, optional }: NullableOptions,
    { defined: d0, nullable: n0, optional: o0 }: NullableOptions,
): NullableOptions => ({
    defined: defined && d0,
    nullable: nullable || n0,
    optional: optional || o0,
});

interface EitherArrangement {
    types: TildaDefinitionEntity[];
    nullablePart: NullableOptions;
}

const arrangeEitherTypes = (
    { type, ...outerNullablePart }: EitherTypeDefinition,
    options: Omit<ReprOptions, "useValue">,
): EitherArrangement => {
    let fullNullablePart = outerNullablePart;
    const types: (TildaDefinitionEntity | TildaDefinitionEntity[])[] = [];
    for (const { type: t, ...innerNullablePart } of type.types) {
        fullNullablePart = mergeNullable(fullNullablePart, innerNullablePart);
        if (t._tildaEntityType === "either") {
            const { types: subtypeTypes, nullablePart: subtypeNullablePart } =
                arrangeEitherTypes(
                    { type: t, ...defaultNullableOptions },
                    options,
                );
            types.push(subtypeTypes);
            fullNullablePart = mergeNullable(
                fullNullablePart,
                subtypeNullablePart,
            );
        } else {
            types.push(t);
        }
    }

    if (type.name) {
        return {
            types: [type],
            nullablePart: fullNullablePart,
        };
    }

    const unique = types.flat().reduce((arr, current) => {
        if (arr.findIndex(t => t === current) === -1) {
            arr.push(current);
        }
        return arr;
    }, [] as TildaDefinitionEntity[]);
    return {
        types: unique,
        nullablePart: fullNullablePart,
    };
};

export function typeRepr(
    nullableOptions: NullableOptions,
    options: Omit<ReprOptions, "useValue">,
): TypeStringRepresentation;
export function typeRepr(
    definition: Definition,
    options: Omit<ReprOptions, "useValue">,
): TypeStringRepresentation;
export function typeRepr(
    definition: Definition | NullableOptions,
    options: Omit<ReprOptions, "useValue">,
): TypeStringRepresentation {
    const { type, ...nullablePart } = definition as Definition;
    if (!type) {
        return joinTypeParts(
            nullablePart.nullable && ReprDefinitions.NULL,
            !nullablePart.defined && ReprDefinitions.UNDEFINED,
            options.hasPropertyCheck &&
                nullablePart.optional &&
                ReprDefinitions.NO_PROPERTY,
        );
    }
    if (type._tildaEntityType === "either") {
        const { types, nullablePart } = arrangeEitherTypes(
            definition as EitherTypeDefinition,
            options,
        );
        const nullableStr = typeRepr(nullablePart, options);
        if (type.name) {
            return nullableStr
                ? encase(joinTypeParts(type.name, nullableStr))
                : type.name;
        }
        const typeRs = types.map(t =>
            typeRepr({ type: t, ...defaultNullableOptions }, options),
        );
        nullableStr && typeRs.push(nullableStr);
        const typeR = typeRs.join(ReprDefinitions.DELIM_OR);
        return typeRs.length > 1 ? encase(typeR) : typeR;
    }
    const nullableStr = typeRepr(nullablePart, options);
    if (type._tildaEntityType === "staticArray") {
        return joinTypeParts(
            type.name ||
                `[${type.types
                    .map(t => typeRepr(t, options))
                    .join(ReprDefinitions.DELIM_COLON)}]`,
            nullableStr,
        );
    }
    if (
        type._tildaEntityType === "scalar" ||
        type._tildaEntityType === "schema"
    ) {
        return joinTypeParts(type.name, nullableStr);
    }
    if (type._tildaEntityType === "array") {
        const elem = typeRepr(type.elemDefinition, options);
        return (
            [
                `${
                    elem.includes(ReprDefinitions.DELIM_OR)
                        ? encase(elem)
                        : elem
                }[]`,
                nullableStr,
            ].filter(s => s) as string[]
        ).join(ReprDefinitions.DELIM_OR);
    }
    throw new Error("Not implemened~");
}
