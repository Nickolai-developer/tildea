import TildaScalarType from "./tilda-scalar-type.js";

export interface PropertyDefinition {
    name: string;
    definition: Definition;
}

export interface Schema {
    _tildaEntityType: "schema";
    name: string;
    definitions: PropertyDefinition[];
}

export interface TildaArrayType {
    _tildaEntityType: "array";
    elemDefinition: Definition;
}

export interface TildaStaticArray {
    _tildaEntityType: "staticArray";
    name?: string;
    types: Definition[];
}

export type Definition =
    | ScalarDefinition
    | SchemaDefinition
    | ArrayDefinition
    | StaticArrayDefinition;

export interface StaticArrayDefinition extends NullableOptions {
    type: TildaStaticArray;
}

export interface ArrayDefinition extends NullableOptions {
    type: TildaArrayType;
}

export interface ScalarDefinition extends NullableOptions {
    type: TildaScalarType;
}

export interface SchemaDefinition extends NullableOptions {
    type: Schema;
}

export interface NullableOptions {
    /** Can be not a property */
    optional: boolean;
    /** Can be null */
    nullable: boolean;
    /** Can't be undefined */
    defined: boolean;
}

export type TildaDefinitionEntity = TildaScalarType | Schema | TildaArrayType;

export type ScalarType = number | bigint | string | boolean | undefined | null;

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

export type TypeStringRepresentation = string;

export interface ReprOptions {
    /** make difference between missing property and undefined */
    hasPropertyCheck?: boolean;
    /** display value instead of string representation where's possible */
    useValue?: boolean;
}
