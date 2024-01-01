import ExactTypeEntity from "./entities/entity.ts";

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

export type TypeEntity = ExactTypeEntity | DependencyIndex;

export type DependencyIndex = string;

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
