import {
    Definition,
    NullableOptions,
    ReprOptions,
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

export function typeRepr(
    definition: Definition,
    options: Omit<ReprOptions, "useValue">,
): TypeStringRepresentation;
export function typeRepr(
    nullableOptions: NullableOptions,
    options: Omit<ReprOptions, "useValue">,
): TypeStringRepresentation;
export function typeRepr(
    definition: Definition | NullableOptions,
    { hasPropertyCheck }: Omit<ReprOptions, "useValue">,
): TypeStringRepresentation {
    const { type, ...nullablePart } = definition as Definition;
    if (!type) {
        return joinTypeParts(
            nullablePart.nullable && ReprDefinitions.NULL,
            !nullablePart.defined && ReprDefinitions.UNDEFINED,
            hasPropertyCheck &&
                nullablePart.optional &&
                ReprDefinitions.NO_PROPERTY,
        );
    }
    const nullableStr = typeRepr(nullablePart, { hasPropertyCheck });
    if (type._tildaEntityType === "staticArray") {
        return joinTypeParts(
            type.name ||
                `[${type.types
                    .map(t => typeRepr(t, { hasPropertyCheck }))
                    .join(ReprDefinitions.DELIM_COLON)}]`,
            nullableStr,
        );
    }
    if (type._tildaEntityType === "either") {
        const [parenL, parenR] = type.types.length > 1 ? ["(", ")"] : ["", ""];
        return joinTypeParts(
            type.name ||
                `${parenL}${type.types
                    .map(t => typeRepr(t, { hasPropertyCheck }))
                    .join(ReprDefinitions.DELIM_OR)}${parenR}`,
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
        const elem = typeRepr(type.elemDefinition, { hasPropertyCheck });
        const [parenL, parenR] = elem.includes(ReprDefinitions.DELIM_OR)
            ? ["(", ")"]
            : ["", ""];
        return (
            [`${parenL}${elem}${parenR}[]`, nullableStr].filter(
                s => s,
            ) as string[]
        ).join(ReprDefinitions.DELIM_OR);
    }
    throw new Error("Not implemened~");
}
