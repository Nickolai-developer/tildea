import ArrayType from "./entities/array.ts";
import EitherType from "./entities/either.ts";
import ExactTypeEntity from "./entities/entity.ts";
import ScalarType from "./entities/scalar.ts";
import Schema from "./entities/schema.ts";
import StaticArrayType from "./entities/static-array.ts";

// export type TypeDescription =
//     | typeof String
//     | ExactTypeEntity
//     | ArrayDescription
//     | StaticArrayDescription
//     | EitherDescription;

// export type ArrayDescription =
//     | [ExactTypeEntity]
//     | [[ExactTypeEntity], Partial<NullableOptions>];

// export type StaticArrayElementDescription =
//     | ExactTypeEntity
//     | [ExactTypeEntity, Partial<NullableOptions>];

// export type StaticArrayDescription = [
//     "STATIC",
//     StaticArrayElementDescription,
//     ...StaticArrayElementDescription[],
// ];

// export type EitherDescription = [
//     "EITHER",
//     ExactTypeEntity,
//     ExactTypeEntity,
//     ...ExactTypeEntity[],
// ];

export interface ReprOptions {
    /** make difference between missing property and undefined */
    hasPropertyCheck?: boolean;
    /** display value instead of string representation where's possible */
    useValue?: boolean;
}

export interface NullableOptions {
    /** Can be not a property */
    optional: boolean;
    /** Can be null */
    nullable: boolean;
    /** Can't be undefined */
    defined: boolean;
}

export type Definition = CompleteDefinition | DependencyIndex;

export type TypeEntity = ExactTypeEntity | DependencyIndex;

export type DependencyIndex = string;

export interface CompleteDefinition {
    type: ExactTypeEntity;
    nullableOptions: NullableOptions;
}

export interface EitherTypeDefinition extends CompleteDefinition {
    type: EitherType;
}

export interface StaticArrayDefinition extends CompleteDefinition {
    type: StaticArrayType;
}

export interface ArrayDefinition extends CompleteDefinition {
    type: ArrayType;
}

export interface ScalarDefinition extends CompleteDefinition {
    type: ScalarType;
}

export interface SchemaDefinition extends CompleteDefinition {
    type: Schema;
}

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
