import TildaScalarType from "./tilda-scalar-type.js";

export interface Schema {
    [field: string]: Definition;
}

export type Definition = ScalarDefinition | SchemaDefinition;

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

export type DefinitionType = TildaScalarType | Schema;

export type ScalarType = number | bigint | string | boolean | undefined | null;

export interface TypeMisuseResult {
    expected: string;
    found: string;
}

export type TypeStringRepresentation = string;

export interface ReprOptions {
    /** make difference between missing property and undefined */
    hasPropertyCheck?: boolean;
    /** display value instead of string representation where's possible */
    useValue?: boolean;
}
