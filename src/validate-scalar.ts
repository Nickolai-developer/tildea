import {
    ReprOptions,
    ScalarDefinition,
    TypeMisuseResult,
} from "./interfaces.js";
import { ReprDefinitions, repr, typeRepr } from "./repr.js";
import TildaScalarType from "./tilda-scalar-type.js";
import validateNullable from "./validate-nullable.js";

const enrichWithType = (
    { expected, found }: TypeMisuseResult,
    type: TildaScalarType,
): TypeMisuseResult => ({
    found,
    expected: [type.name, expected]
        .filter(p => p)
        .join(ReprDefinitions.DELIMETER),
});

export default function validateScalar(
    scalar: unknown,
    definition: ScalarDefinition,
    options: ReprOptions,
): TypeMisuseResult | null;
export default function validateScalar(
    obj: object,
    propertyName: string,
    definition: ScalarDefinition,
    options: ReprOptions,
): TypeMisuseResult | null;
export default function validateScalar(
    arg1: unknown | object,
    arg2: ScalarDefinition | string,
    arg3: ReprOptions | ScalarDefinition,
    arg4?: ReprOptions,
): TypeMisuseResult | null {
    let obj, propertyName, scalar, definition, options, nullable;
    if (arg4) {
        obj = arg1 as object;
        propertyName = arg2 as string;
        definition = arg3 as ScalarDefinition;
        options = arg4;
        scalar = (obj as any)[propertyName];
        nullable = validateNullable(obj, propertyName, definition, options);
    } else {
        scalar = arg1;
        definition = arg2 as ScalarDefinition;
        options = arg3 as ReprOptions;
        nullable = validateNullable(scalar, definition, options);
    }

    if (nullable) {
        return enrichWithType(nullable, definition.type);
    }
    if (scalar === null || scalar === undefined) {
        return null;
    }
    if (!definition.type.validate(scalar)) {
        return {
            found: repr(scalar, options),
            expected: typeRepr(definition, options),
        };
    }
    return null;
}