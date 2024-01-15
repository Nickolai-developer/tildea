import type { Schema } from "../entities/schema.js";
import type {
    DependencyIndex,
    NullableOptions,
    PropertyValidationResult,
    ReprOptions,
    SchemaValidationResult,
} from "../index.js";
import { useOptions, usedReprOpts } from "../config.js";
import { TildeaRuntimeError, TildeaSchemaBuildingError } from "../errors.js";
import { TypeDescription } from "./schema-builder.js";

function validateSchema(obj: object, schema: Schema): SchemaValidationResult {
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
            return errors[0].subproperties;
        } else {
            return [{ ...errors[0], name: "" }];
        }
    }

    return null;
}

export const Store = new WeakMap<Function, Schema>();

export abstract class Inspectable {
    public static inspect<T extends Inspectable>(
        obj: T,
        options?: ReprOptions,
    ): SchemaValidationResult {
        const schema = this.getSchema(true);
        if (!schema.fullyDefined) {
            throw new TildeaRuntimeError(
                `Schema \`${this.name}\` is a template schema.`,
            );
        }
        const holdOptions = usedReprOpts;
        options && useOptions(options);
        const result = validateSchema(obj, schema);
        useOptions(holdOptions);
        return result;
    }

    public static apply(...args: TypeDescription[]): typeof Inspectable {
        const template = this.getSchema();
        class AppliedTemplate extends this {}
        Store.set(AppliedTemplate, template.use(...args));
        return AppliedTemplate;
    }

    public static opts(options: Partial<NullableOptions>): Schema {
        return this.getSchema().opts(options);
    }

    public static declare(...args: DependencyIndex[]): Schema {
        return this.getSchema().declare(...args);
    }

    public static use(...args: TypeDescription[]): Schema {
        return this.getSchema().use(...args);
    }

    private static getSchema(runtime?: boolean): Schema {
        const schema = Store.get(this);
        if (!schema) {
            throw new (
                runtime ? TildeaRuntimeError : TildeaSchemaBuildingError
            )(`No schema was defined for \`${this.name}\` class.`);
        }
        return schema;
    }
}
