export type Type = typeof String | TildaTypeEntity;

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

export type DefinitionEntity = Definition | DependencyIndex;

export type DependencyIndex = string;

export interface Definition {
    type: TildaTypeEntity;
    nullableOptions: NullableOptions;
}

export type TildaTypeEntity =
    | TildaSchema
    | TildaScalarType
    | TildaArrayType
    | TildaStaticArrayType
    | TildaEitherType;

export interface TildaSchema {
    _tildaEntityType: "schema";
    name: string;
    definitions: SchemaPropertyDefinition[];
}

interface SchemaPropertyDefinition {
    name: string;
    definition: Definition /*  | DependencyIndex */;
}

export interface TildaScalarType {
    _tildaEntityType: "scalar";
    validate: (v: unknown) => boolean;
    name: string;
}

export interface TildaArrayType {
    _tildaEntityType: "array";
    elemDefinition: Definition;
}

export interface TildaStaticArrayType {
    _tildaEntityType: "staticArray";
    name?: string;
    types: Definition /* | DependencyIndex) */[];
}

export interface TildaEitherType {
    _tildaEntityType: "either";
    name?: string;
    types: TildaTypeEntity /*  | DependencyIndex) */[];
}

export interface EitherTypeDefinition extends Definition {
    type: TildaEitherType;
}

export interface StaticArrayDefinition extends Definition {
    type: TildaStaticArrayType;
}

export interface ArrayDefinition extends Definition {
    type: TildaArrayType;
}

export interface ScalarDefinition extends Definition {
    type: TildaScalarType;
}

export interface SchemaDefinition extends Definition {
    type: TildaSchema;
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
