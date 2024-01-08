import type { ExactTypeEntity } from "./entities/entity.js";
import type { ScalarType } from "./entities/scalar.js";
import { Inspectable } from "./initialization/inspectable.js";
import { TypeDescription } from "./initialization/schema-builder.js";

declare global {
    interface Array<T> {
        use(...args: TypeDescription[]): ExactTypeEntity;
        declare(...args: DependencyIndex[]): ExactTypeEntity;
    }
    interface StringConstructor {
        opts(options: Partial<NullableOptions>): ScalarType;
    }
}

/**
 * Options which affect validation output style and some edge case logics such as
 * taking into account existence of property or considering `undefined` as absence of property
 */
export interface ReprOptions {
    /** make difference between missing property and undefined */
    hasPropertyCheck?: boolean;
    /** display value instead of string representation where's possible */
    useValue?: boolean;
}

/** Options determining what null values can be considered valid values of a property */
export interface NullableOptions {
    /** Can be not a property */
    optional: boolean;
    /** Can be null */
    nullable: boolean;
    /** Can't be undefined */
    defined: boolean;
}

/** Identifier of a dependency to use in place */
export type DependencyIndex = Exclude<string, "EITHER" | "STATIC">;

export interface TypeMisuseResult {
    expected: string;
    found: string;
}

export interface PropertyValidationResult extends TypeMisuseResult {
    name: string;
    subproperties?: PropertyValidationResult[];
}

export interface SchemaValidationResult {
    errors: PropertyValidationResult[] | null;
}

export type TypeRepresentation = string;

export interface PropertyValidationStreamableMessage extends TypeMisuseResult {
    name: string;
    depth: number;
}

export default {
    Inspectable,
};
