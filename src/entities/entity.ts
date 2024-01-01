import { nullableDefaults } from "../constants.js";
import {
    CompleteDefinition,
    NullableOptions,
    PropertyValidationStreamableMessage,
    ReprOptions,
    TypeRepresentation,
} from "../interfaces.js";
import { ReprDefinitions, repr } from "../validation/repr.js";
import validateNullable from "../validation/validate-nullable.js";

export const TERMINATE_EXECUTION: string = "terminate";

export interface EntityInput {
    nullable?: Partial<NullableOptions>;
}

export default abstract class ExactTypeEntity {
    readonly entity: string;
    nullable: NullableOptions;

    constructor({ nullable }: EntityInput) {
        this.nullable = Object.assign({}, nullableDefaults, nullable);
    }

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

    // TODO: redefine it in child classes for safety
    protected copy<T extends ExactTypeEntity>(): T {
        return new (this.constructor as new (input: EntityInput) => T)(this);
    }

    public opts(options: Partial<NullableOptions>) {
        const cp = this.copy();
        cp.nullable = Object.assign({}, nullableDefaults, options);
        return cp;
    }

    protected joinTypeParts(
        ...args: (string | false | null | undefined)[]
    ): TypeRepresentation {
        return args.filter(s => s).join(ReprDefinitions.DELIM_OR);
    }

    protected encase(type: TypeRepresentation): TypeRepresentation {
        return type.startsWith("(") && type.endsWith(")") ? type : `(${type})`;
    }

    public repr(options: ReprOptions): TypeRepresentation {
        const { defined, nullable, optional } = this.nullable;
        return this.joinTypeParts(
            nullable && ReprDefinitions.NULL,
            !defined && ReprDefinitions.UNDEFINED,
            options.hasPropertyCheck && optional && ReprDefinitions.NO_PROPERTY,
        );
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
                expected: definition.type.repr(options),
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
