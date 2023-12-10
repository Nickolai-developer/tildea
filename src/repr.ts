import {
    Definition,
    DefinitionType,
    NullableOptions,
    TypeStringRepresentation,
} from "./interfaces.js";
import TildaScalarType from "./tilda-scalar-type.js";

export enum ReprDefinitions {
    DELIMETER = " | ",
    NO_PROPERTY = "<no-property>",
    UNDEFINED = "undefined",
    NULL = "null",
    NAN = "<NaN>",
    OBJECT = "<object>",
}

export interface ReprOptions {
    /** make difference between missing property and undefined */
    hasPropertyCheck?: boolean;
    /** display value instead of string representation where's possible */
    useValue?: boolean;
}

export function repr(
    val: any,
    options?: Omit<ReprOptions, "hasPropertyCheck">,
): TypeStringRepresentation;
export function repr(
    obj: object,
    field: string,
    options?: ReprOptions,
): TypeStringRepresentation;
export function repr(
    valOrObj: any,
    fieldOrOptions?: string | ReprOptions,
    opts?: ReprOptions,
): TypeStringRepresentation {
    let val, obj, field: string, options: ReprOptions;
    if (typeof fieldOrOptions === "string") {
        field = fieldOrOptions;
        obj = valOrObj;
        options = opts || {};
        return obj.hasOwnProperty(field)
            ? repr(obj[field], options)
            : options.hasPropertyCheck
            ? ReprDefinitions.NO_PROPERTY
            : ReprDefinitions.UNDEFINED;
    } else {
        val = valOrObj;
        options = fieldOrOptions || {};
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
    if (!type || type instanceof TildaScalarType) {
        return (
            [
                type && type.repr,
                nullable && ReprDefinitions.NULL,
                !defined && ReprDefinitions.UNDEFINED,
                hasPropertyCheck && optional && ReprDefinitions.NO_PROPERTY,
            ].filter(s => typeof s === "string") as string[]
        ).join(ReprDefinitions.DELIMETER);
    }
    throw new Error("Not implemened~");
}
