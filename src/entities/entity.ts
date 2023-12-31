import {
    CompleteDefinition,
    PropertyValidationStreamableMessage,
    ReprOptions,
} from "../interfaces.js";
import { ReprDefinitions, repr, typeRepr } from "../validation/repr.js";
import validateNullable from "../validation/validate-nullable.js";

export const TERMINATE_EXECUTION: string = "terminate";

export default abstract class ExactTypeEntity {
    readonly entity: string;

    public abstract execute(
        obj: object,
        key: string,
        def: CompleteDefinition,
        options: ReprOptions,
        currentDepth: number,
    ): Generator<PropertyValidationStreamableMessage, void, void>;

    protected *redundantPropsErrors(
        obj: object,
        objectOwnKeys: string[],
        options: ReprOptions,
        currentDepth: number,
    ): Generator<PropertyValidationStreamableMessage, void, void> {
        const objKeys = Object.keys(obj);
        const redundantKeys = objKeys.filter(
            key => !objectOwnKeys.includes(key),
        );

        for (const key of redundantKeys) {
            if (
                obj[key as keyof object] === undefined &&
                !options.hasPropertyCheck
            ) {
                continue;
            }
            yield {
                name: key,
                depth: currentDepth,
                expected: options.hasPropertyCheck
                    ? ReprDefinitions.NO_PROPERTY
                    : ReprDefinitions.UNDEFINED,
                found: repr(obj, key, options),
            };
        }
    }

    protected *checkNulls(
        obj: object,
        key: string,
        definition: CompleteDefinition,
        options: ReprOptions,
        currentDepth: number,
    ): Generator<PropertyValidationStreamableMessage | string, void, void> {
        const valNull = validateNullable(
            obj,
            key,
            definition.nullableOptions,
            options,
        );
        if (valNull) {
            yield {
                name: key,
                depth: currentDepth,
                expected: typeRepr(definition, options),
                found: valNull.found,
            };
            return;
        }

        const propR = repr(obj, key, options);

        if (
            [
                ReprDefinitions.NULL,
                ReprDefinitions.UNDEFINED,
                ReprDefinitions.NO_PROPERTY,
            ].includes(propR as ReprDefinitions)
        ) {
            yield TERMINATE_EXECUTION;
        }
    }
}
