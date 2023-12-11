import {
    Definition,
    DefinitionType,
    NullableOptions,
    ReprOptions,
    TypeStringRepresentation,
} from "./interfaces.js";

export enum ReprDefinitions {
    DELIMETER = " | ",
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
    const { defined, nullable, optional } = definition;
    const type: DefinitionType | undefined = (definition as Definition).type;
    if (!type) {
        return (
            [
                nullable && ReprDefinitions.NULL,
                !defined && ReprDefinitions.UNDEFINED,
                hasPropertyCheck && optional && ReprDefinitions.NO_PROPERTY,
            ].filter(s => typeof s === "string") as string[]
        ).join(ReprDefinitions.DELIMETER);
    }
    if (
        type._tildaEntityType === "scalar" ||
        type._tildaEntityType === "schema"
    ) {
        return (
            [
                type.name,
                nullable && ReprDefinitions.NULL,
                !defined && ReprDefinitions.UNDEFINED,
                hasPropertyCheck && optional && ReprDefinitions.NO_PROPERTY,
            ].filter(s => typeof s === "string") as string[]
        ).join(ReprDefinitions.DELIMETER);
    }
    throw new Error("Not implemened~");
}
