import ScalarType from "./entities/scalar.js";
import { NullableOptions, ReprOptions } from "./interfaces.js";

export const nullableDefaults: NullableOptions = {
    defined: true,
    nullable: false,
    optional: false,
};

export const reprDefaults: ReprOptions = {
    hasPropertyCheck: false,
    useValue: false,
};

export const Any = new ScalarType({
    name: "Any",
    validate: () => true,
});

export const Int = new ScalarType({
    name: "Int",
    validate: val => Number.isInteger(val),
});

export const String_ = new ScalarType({
    name: "String",
    validate: val => typeof val === "string",
});
