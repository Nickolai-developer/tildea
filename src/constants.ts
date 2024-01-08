import { ScalarType } from "./entities/scalar.js";

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
