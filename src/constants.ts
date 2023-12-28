import { NullableOptions, ReprOptions, TildaScalarType } from "./interfaces.js";

export const nullableDefaults: NullableOptions = {
    defined: true,
    nullable: false,
    optional: false,
};

export const reprDefaults: ReprOptions = {
    hasPropertyCheck: false,
    useValue: false,
};

export const Any: TildaScalarType = {
    _tildaEntityType: "scalar",
    name: "Any",
    validate: () => true,
};

export const Int: TildaScalarType = {
    _tildaEntityType: "scalar",
    name: "Int",
    validate: val => Number.isInteger(val),
};

export const String_: TildaScalarType = {
    _tildaEntityType: "scalar",
    name: "String",
    validate: val => typeof val === "string",
};
