import { usedReprOptions } from "../config.js";
import { ReprOptions, SchemaValidationResult } from "../interfaces.js";
import validateSchema from "../validation/validate-schema.js";
import Store from "./store.js";

export default class Inspectable {
    public static inspect<T extends Inspectable>(
        obj: T,
        options?: ReprOptions,
    ): SchemaValidationResult {
        const schema = Store.get(this);
        if (!schema) {
            throw new Error(`No schema defined for ${this.name}`);
        }
        return validateSchema(
            obj,
            schema,
            Object.assign({}, usedReprOptions, options || {}),
        );
    }
}
