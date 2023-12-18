import {
    NullableOptions,
    ReprOptions,
    TypeMisuseResult,
} from "./interfaces.js";
import { ReprDefinitions, nullableRepr, repr } from "./repr.js";

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
        const propR = repr(arg1 as object, arg2, arg4!);
        if (
            ![
                ReprDefinitions.NULL,
                ReprDefinitions.UNDEFINED,
                ReprDefinitions.NO_PROPERTY,
            ].includes(propR as ReprDefinitions)
        ) {
            return null;
        }

        const { defined, nullable, optional } = arg3 as NullableOptions;
        const typeR = nullableRepr({ defined, nullable, optional }, arg4!);
        const possibleNulls = typeR.split(
            ReprDefinitions.DELIM_OR,
        ) as ReprDefinitions[];

        if (possibleNulls.includes(propR as ReprDefinitions)) {
            return null;
        }

        return {
            expected: typeR,
            found: propR,
        };
    } else {
        return validateNullable(
            { value: arg1 },
            "value",
            arg2,
            arg3 as ReprOptions,
        );
    }
}
