import { nullableDefaults } from "../constants.js";
import { Schema, SchemaValidationResult } from "../interfaces.js";
import { ReprDefinitions, typeRepr } from "../repr.js";
import TildaScalarType from "../tilda-scalar-type.js";
import validateSchema from "../validate-schema.js";
import { Clock, UnitTest } from "./common.js";

const Int = new TildaScalarType({
    name: "Int",
    validate: val => Number.isInteger(val),
});

const String_ = new TildaScalarType({
    name: "string",
    validate: val => typeof val === "string",
});

const unitTest: UnitTest = {
    name: "validate-schema-advanced",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);
        const s04: Schema = {
            _tildaEntityType: "schema",
            name: "S04",
            definitions: [
                {
                    name: "a",
                    definition: {
                        type: Int,
                        nullableOptions: nullableDefaults,
                    },
                },
                {
                    name: "b",
                    definition: {
                        type: String_,
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        };
        const s14: Schema = {
            _tildaEntityType: "schema",
            name: "S14",
            definitions: [
                {
                    name: "b",
                    definition: {
                        type: Int,
                        nullableOptions: nullableDefaults,
                    },
                },
                {
                    name: "a",
                    definition: {
                        type: String_,
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        };
        const s4: Schema = {
            _tildaEntityType: "schema",
            name: "S4",
            definitions: [
                {
                    name: "prop1",
                    definition: {
                        type: {
                            _tildaEntityType: "either",
                            types: [Int, String_, s04, s14],
                        },
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        };
        clock.assertEqual(validateSchema({ prop1: 0 }, s4, {}), {
            errors: null,
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: "0" }, s4, {}), {
            errors: null,
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: true }, s4, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: typeRepr(s4.definitions[0].definition, {}),
                    found: "boolean",
                },
            ],
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: {} }, s4, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: typeRepr(s4.definitions[0].definition, {}),
                    found: ReprDefinitions.OBJECT,
                    subproperties: [
                        {
                            name: "a",
                            expected: typeRepr(
                                {
                                    type: Int,
                                    nullableOptions: nullableDefaults,
                                },
                                {},
                            ),
                            found: ReprDefinitions.UNDEFINED,
                        },
                        {
                            name: "b",
                            expected: typeRepr(
                                {
                                    type: String_,
                                    nullableOptions: nullableDefaults,
                                },
                                {},
                            ),
                            found: ReprDefinitions.UNDEFINED,
                        },
                    ],
                },
            ],
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: { a: 0 } }, s4, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: typeRepr(s4.definitions[0].definition, {}),
                    found: ReprDefinitions.OBJECT,
                    subproperties: [
                        {
                            name: "b",
                            expected: typeRepr(
                                {
                                    type: String_,
                                    nullableOptions: nullableDefaults,
                                },
                                {},
                            ),
                            found: ReprDefinitions.UNDEFINED,
                        },
                    ],
                },
            ],
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: { a: "0" } }, s4, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: typeRepr(s4.definitions[0].definition, {}),
                    found: ReprDefinitions.OBJECT,
                    subproperties: [
                        {
                            name: "b",
                            expected: typeRepr(
                                {
                                    type: Int,
                                    nullableOptions: nullableDefaults,
                                },
                                {},
                            ),
                            found: ReprDefinitions.UNDEFINED,
                        },
                    ],
                },
            ],
        } as SchemaValidationResult);
    },
};

export default unitTest;
