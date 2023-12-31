import { Int, String_ } from "../constants.js";
import Schema from "../entities/schema.js";
import {
    NullableOptions,
    ReprOptions,
    SchemaValidationResult,
} from "../interfaces.js";
import { ReprDefinitions } from "../validation/repr.js";
import validateSchema from "../validation/validate-schema.js";
import { Clock, UnitTest } from "./common.js";

const null0: NullableOptions = {
    defined: true,
    nullable: false,
    optional: false,
};

const opts1: ReprOptions = {
    hasPropertyCheck: true,
};

const unitTest: UnitTest = {
    name: "validate-schema-common",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);

        const s1 = new Schema({
            name: "Schema1",
            definitions: [
                {
                    name: "prop1",
                    definition: { type: Int, nullableOptions: null0 },
                },
            ],
        });
        clock.assertEqual(validateSchema({ prop1: 0 }, s1, {}), {
            errors: null,
        });
        clock.assertEqual(validateSchema({ prop1: "0" }, s1, {}), {
            errors: [{ name: "prop1", expected: "Int", found: "string" }],
        } as SchemaValidationResult);

        clock.assertEqual(validateSchema({}, s1, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: "Int",
                    found: ReprDefinitions.UNDEFINED,
                },
            ],
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({}, s1, opts1), {
            errors: [
                {
                    name: "prop1",
                    expected: "Int",
                    found: ReprDefinitions.NO_PROPERTY,
                },
            ],
        } as SchemaValidationResult);

        clock.assertEqual(validateSchema({ prop2: "value" }, s1, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: "Int",
                    found: ReprDefinitions.UNDEFINED,
                },
                {
                    name: "prop2",
                    expected: ReprDefinitions.UNDEFINED,
                    found: "string",
                },
            ],
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop2: "value" }, s1, opts1), {
            errors: [
                {
                    name: "prop1",
                    expected: "Int",
                    found: ReprDefinitions.NO_PROPERTY,
                },
                {
                    name: "prop2",
                    expected: ReprDefinitions.NO_PROPERTY,
                    found: "string",
                },
            ],
        } as SchemaValidationResult);

        clock.assertEqual(
            validateSchema({ prop2: "value" }, s1, {
                hasPropertyCheck: true,
                useValue: true,
            }),
            {
                errors: [
                    {
                        name: "prop1",
                        expected: "Int",
                        found: ReprDefinitions.NO_PROPERTY,
                    },
                    {
                        name: "prop2",
                        expected: ReprDefinitions.NO_PROPERTY,
                        found: '"value"',
                    },
                ],
            } as SchemaValidationResult,
        );

        const s12 = new Schema({
            name: "Schema2",
            definitions: [
                {
                    name: "prop1",
                    definition: {
                        type: Int,
                        nullableOptions: {
                            defined: true,
                            optional: false,
                            nullable: true,
                        },
                    },
                },
            ],
        });
        const s13 = new Schema({
            name: "Schema2",
            definitions: [
                {
                    name: "prop1",
                    definition: {
                        type: Int,
                        nullableOptions: {
                            defined: true,
                            optional: true,
                            nullable: true,
                        },
                    },
                },
            ],
        });
        clock.assertEqual(
            validateSchema({ prop2: "value" }, s12, {
                hasPropertyCheck: true,
                useValue: true,
            }),
            {
                errors: [
                    {
                        name: "prop1",
                        expected:
                            "Int" +
                            ReprDefinitions.DELIM_OR +
                            ReprDefinitions.NULL,
                        found: ReprDefinitions.NO_PROPERTY,
                    },
                    {
                        name: "prop2",
                        expected: ReprDefinitions.NO_PROPERTY,
                        found: '"value"',
                    },
                ],
            } as SchemaValidationResult,
        );
        clock.assertEqual(
            validateSchema({ prop1: undefined, prop2: "value" }, s13, {
                hasPropertyCheck: true,
                useValue: true,
            }),
            {
                errors: [
                    {
                        name: "prop1",
                        expected:
                            "Int" +
                            ReprDefinitions.DELIM_OR +
                            ReprDefinitions.NULL +
                            ReprDefinitions.DELIM_OR +
                            ReprDefinitions.NO_PROPERTY,
                        found: ReprDefinitions.UNDEFINED,
                    },
                    {
                        name: "prop2",
                        expected: ReprDefinitions.NO_PROPERTY,
                        found: '"value"',
                    },
                ],
            } as SchemaValidationResult,
        );

        const s2 = new Schema({
            name: "Schema2",
            definitions: [
                {
                    name: "prop0",
                    definition: {
                        type: String_,
                        nullableOptions: {
                            defined: true,
                            nullable: true,
                            optional: true,
                        },
                    },
                },
                {
                    name: "schemaProp",
                    definition: {
                        type: s1,
                        nullableOptions: {
                            defined: true,
                            nullable: true,
                            optional: false,
                        },
                    },
                },
            ],
        });
        clock.assertEqual(
            validateSchema({ schemaProp: { prop1: 0 } }, s2, {
                hasPropertyCheck: true,
            }),
            { errors: null },
        );
        clock.assertEqual(
            validateSchema({ schemaProp: { prop1: 0 }, prop0: undefined }, s2, {
                hasPropertyCheck: true,
            }),
            {
                errors: [
                    {
                        name: "prop0",
                        expected:
                            "String" +
                            ReprDefinitions.DELIM_OR +
                            ReprDefinitions.NULL +
                            ReprDefinitions.DELIM_OR +
                            ReprDefinitions.NO_PROPERTY,
                        found: ReprDefinitions.UNDEFINED,
                    },
                ],
            } as SchemaValidationResult,
        );
        clock.assertEqual(
            validateSchema({ schemaProp: { prop1: 0 } }, s2, {
                hasPropertyCheck: false,
            }),
            {
                errors: [
                    {
                        name: "prop0",
                        expected:
                            "String" +
                            ReprDefinitions.DELIM_OR +
                            ReprDefinitions.NULL,
                        found: ReprDefinitions.UNDEFINED,
                    },
                ],
            } as SchemaValidationResult,
        );

        clock.assertEqual(
            validateSchema({ schemaProp: { prop1: [], prop2: 4 } }, s2, {
                hasPropertyCheck: true,
            }),
            {
                errors: [
                    {
                        name: "schemaProp",
                        expected:
                            s1.name +
                            ReprDefinitions.DELIM_OR +
                            ReprDefinitions.NULL,
                        found: ReprDefinitions.OBJECT,
                        subproperties: [
                            {
                                name: "prop1",
                                expected: "Int",
                                found: ReprDefinitions.OBJECT,
                            },
                            {
                                name: "prop2",
                                expected: ReprDefinitions.NO_PROPERTY,
                                found: "number",
                            },
                        ],
                    },
                ],
            } as SchemaValidationResult,
        );
        clock.assertEqual(
            validateSchema({ schemaProp: "{ prop1: 0 }", prop0: null }, s2, {}),
            {
                errors: [
                    {
                        name: "schemaProp",
                        expected:
                            s1.name +
                            ReprDefinitions.DELIM_OR +
                            ReprDefinitions.NULL,
                        found: "string",
                    },
                ],
            } as SchemaValidationResult,
        );
    },
};

export default unitTest;
