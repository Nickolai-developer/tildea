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
    entity: "SCALAR",
    name: "Any",
    validate: () => true,
};

export const Int: ScalarType = {
    entity: "SCALAR",
    name: "Int",
    validate: val => Number.isInteger(val),
};

export const String_: ScalarType = {
    entity: "SCALAR",
    name: "String",
    validate: val => typeof val === "string",
};
