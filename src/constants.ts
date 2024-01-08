import { ScalarType } from "./entities/scalar.js";

export const Any = new ScalarType({
    name: "Any",
    validate: () => true,
});

export const Int = new ScalarType({
    name: "Int",
    validate: val => Number.isInteger(val),
});

export const Float = new ScalarType({
    name: "Float",
    validate: val => typeof val === "number",
});

export const String_ = new ScalarType({
    name: "String",
    validate: val => typeof val === "string",
});

export const Null = new ScalarType({
    name: "",
    validate: val => val === null,
}).opts({ nullable: true });

export const Undefined = new ScalarType({
    name: "",
    validate: val => val === undefined,
}).opts({ defined: false });

export const Optional = new ScalarType({
    name: "",
    validate: val => val === undefined,
}).opts({ optional: true });
