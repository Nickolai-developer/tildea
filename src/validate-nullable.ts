import {
    NullableOptions,
    ReprOptions,
    TypeMisuseResult,
} from "./interfaces.js";
import { repr, typeRepr } from "./repr.js";

export default function validateNullable(
    value: unknown,
    nullableOptions: NullableOptions,
    options: ReprOptions,
): TypeMisuseResult | null;
export default function validateNullable(
    obj: object,
    propertyName: string,
    nullableOptions: NullableOptions,
    options: ReprOptions,
): TypeMisuseResult | null;
export default function validateNullable(
    arg1: object | unknown,
    arg2: NullableOptions | string,
    arg3: ReprOptions | NullableOptions,
    arg4?: ReprOptions,
): TypeMisuseResult | null {
    if (typeof arg2 === "string") {
        if (
            arg4!.hasPropertyCheck &&
            !(arg3 as NullableOptions).optional &&
            !(arg1 as object).hasOwnProperty(arg2)
        ) {
            const { defined, nullable, optional } = arg3 as NullableOptions;
            return {
                found: repr(arg1 as object, arg2, arg4!),
                expected: typeRepr({ defined, nullable, optional }, arg4!),
            };
        } else {
            return validateNullable(
                (arg1 as any)[arg2],
                arg3 as NullableOptions,
                arg4!,
            );
        }
    } else {
        const value = arg1,
            { defined, nullable, optional } = arg2,
            options = arg3 as ReprOptions;
        if (value !== undefined && value !== null) {
            return null;
        }
        if (value === null && !nullable) {
            return {
                found: repr(value, options),
                expected: typeRepr({ defined, nullable, optional }, options),
            };
        }
        if (value === undefined && defined) {
            return {
                found: repr(value, options),
                expected: typeRepr({ defined, nullable, optional }, options),
            };
        }
        return null;
    }
}
