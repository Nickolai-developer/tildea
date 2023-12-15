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

export interface TildaEitherType {
    _tildaEntityType: "either";
    name?: string;
    types: TildaDefinitionEntity[];
}

export interface Definition extends NullableOptions {
    type: TildaDefinitionEntity;
}

export interface EitherTypeDefinition extends Definition {
    type: TildaEitherType;
}

export interface StaticArrayDefinition extends Definition {
    type: TildaStaticArray;
}

export interface ArrayDefinition extends Definition {
    type: TildaArrayType;
}

export interface ScalarDefinition extends Definition {
    type: TildaScalarType;
}

export interface SchemaDefinition extends Definition {
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

export type TildaDefinitionEntity =
    | Schema
    | TildaScalarType
    | TildaArrayType
    | TildaStaticArray
    | TildaEitherType;

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
