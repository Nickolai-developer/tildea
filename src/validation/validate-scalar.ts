import ScalarType from "../entities/scalar.js";
import { ReprOptions, TypeMisuseResult } from "../interfaces.js";
import { ReprDefinitions, repr } from "./repr.js";
import validateNullable from "./validate-nullable.js";

const enrichWithType = (
    { expected, found }: TypeMisuseResult,
    type: ScalarType,
): TypeMisuseResult => ({
    expected: [type.name, expected]
        .filter(p => p)
        .join(ReprDefinitions.DELIM_OR),
    found,
});

export default function validateScalar(
    obj: object,
    propertyName: string,
    type: ScalarType,
    options: ReprOptions,
): TypeMisuseResult | null {
    const scalar = (obj as any)[propertyName];
    const nullable = validateNullable(
        obj,
        propertyName,
        type.nullable,
        options,
    );

    if (nullable) {
        return enrichWithType(nullable, type);
    }
    if (scalar === null || scalar === undefined) {
        return null;
    }
    if (!type.validate(scalar)) {
        return {
            expected: type.repr,
            found: repr(scalar, options),
        };
    }
    return null;
}
