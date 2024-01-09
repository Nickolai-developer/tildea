import type { ExactTypeEntity } from "./entities/entity.js";
import type { ScalarType } from "./entities/scalar.js";
import type { TypeDescription } from "./initialization/schema-builder.js";

export * from "./initialization/schema-builder.js";
export { Any, Float, Int, Null, Optional, Undefined } from "./constants.js";
export { Inspectable } from "./initialization/inspectable.js";
export { nullableDefaults, useOptions } from "./config.js";
export * from "./errors.js";

export { Schema } from "./entities/schema.js";
export { ScalarType } from "./entities/scalar.js";
export { ArrayType } from "./entities/array.js";
export { StaticArrayType } from "./entities/static-array.js";
export { EitherType } from "./entities/either.js";

declare global {
    interface Array<T> {
        use(...args: TypeDescription[]): ExactTypeEntity;
        declare(...args: DependencyIndex[]): ExactTypeEntity;
        opts(options: Partial<NullableOptions>): ExactTypeEntity;
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

/**
 * Type in schemas can either be a exact type
 * as well as index pointing on a dependency which is another exact type
 */
export type TypeEntity = ExactTypeEntity | DependencyIndex;

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
