import type { Schema } from "../entities/schema.js";
import type {
    PropertyValidationResult,
    SchemaValidationResult,
} from "../index.js";

export function validateSchema(
    obj: object,
    schema: Schema,
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
        pickFacility(newDepth);
    };

    for (const { depth, ...result } of schema.execute({
        obj: { key: obj },
        key: "key",
        currentDepth: 0,
        depMap: {},
    })) {
        pickFacility(depth);
        currentFacility.push(result);
    }

    if (errors.length) {
        if (errors[0].subproperties) {
            return { errors: errors[0].subproperties! };
        } else {
            return { errors: [{ ...errors[0], name: "" }] };
        }
    }

    return { errors: null };
}
