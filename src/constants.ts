import { NullableOptions, ReprOptions, ScalarType } from "./interfaces.js";

export const nullableDefaults: NullableOptions = {
    defined: true,
    nullable: false,
    optional: false,
};

export const reprDefaults: ReprOptions = {
    hasPropertyCheck: false,
    useValue: false,
};

export const Any: ScalarType = {
    _tildaEntityType: "scalar",
    name: "Any",
    validate: () => true,
};

export const Int: ScalarType = {
    _tildaEntityType: "scalar",
    name: "Int",
    validate: val => Number.isInteger(val),
};

export const String_: ScalarType = {
    _tildaEntityType: "scalar",
    name: "String",
    validate: val => typeof val === "string",
};
