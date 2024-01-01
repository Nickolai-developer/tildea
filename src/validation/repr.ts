import { usedReprOpts } from "../config.js";
import { ReprOptions, TypeRepresentation } from "../interfaces.js";

export enum ReprDefinitions {
    DELIM_OR = " | ",
    DELIM_COLON = ", ",
    NO_PROPERTY = "<no-property>",
    UNDEFINED = "undefined",
    NULL = "null",
    NAN = "<NaN>",
    OBJECT = "<object>",
}
export function repr(val: any, options?: ReprOptions): TypeRepresentation;
export function repr(
    obj: object,
    key: string,
    options?: ReprOptions,
): TypeRepresentation;
export function repr(
    valOrObj: any,
    propOrOptions?: string | ReprOptions,
    opts?: ReprOptions,
): TypeRepresentation {
    let val, obj, property: string, options: ReprOptions;
    if (typeof propOrOptions === "string") {
        property = propOrOptions;
        obj = valOrObj;
        options = opts || usedReprOpts;
        return obj.hasOwnProperty(property)
            ? repr(obj[property], options)
            : options.hasPropertyCheck
            ? ReprDefinitions.NO_PROPERTY
            : ReprDefinitions.UNDEFINED;
    } else {
        val = valOrObj;
        options = propOrOptions || usedReprOpts;
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
