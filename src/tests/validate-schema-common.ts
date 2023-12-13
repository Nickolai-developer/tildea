import {
    NullableOptions,
    ReprOptions,
    Schema,
    SchemaValidationResult,
} from "../interfaces.js";
import { ReprDefinitions } from "../repr.js";
import TildaScalarType from "../tilda-scalar-type.js";
import validateSchema from "../validate-schema.js";
import { Clock, UnitTest } from "./common.js";

const String_ = new TildaScalarType({
    name: "string",
    validate: val => typeof val === "string",
});

const Int = new TildaScalarType({
    name: "Int",
    validate: val => Number.isInteger(val),
});

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

        const s1: Schema = {
            _tildaEntityType: "schema",
            name: "Schema1",
            definitions: [
                {
                    name: "prop1",
                    definition: { type: Int, ...null0 },
                },
            ],
        };
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

        clock.assertEqual(
            validateSchema(
                { prop2: "value" },
                {
                    ...s1,
                    definitions: [
                        {
                            ...s1.definitions[0],
                            definition: {
                                type: Int,
                                defined: true,
                                optional: false,
                                nullable: true,
                            },
                        },
                    ],
                },
                {
                    hasPropertyCheck: true,
                    useValue: true,
                },
            ),
            {
                errors: [
                    {
                        name: "prop1",
                        expected:
                            "Int" +
                            ReprDefinitions.DELIMETER +
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
            validateSchema(
                { prop1: undefined, prop2: "value" },
                {
                    ...s1,
                    definitions: [
                        {
                            ...s1.definitions[0],
                            definition: {
                                type: Int,
                                defined: true,
                                optional: true,
                                nullable: true,
                            },
                        },
                    ],
                },
                {
                    hasPropertyCheck: true,
                    useValue: true,
                },
            ),
            {
                errors: [
                    {
                        name: "prop1",
                        expected:
                            "Int" +
                            ReprDefinitions.DELIMETER +
                            ReprDefinitions.NULL +
                            ReprDefinitions.DELIMETER +
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

        const s2: Schema = {
            _tildaEntityType: "schema",
            name: "Schema2",
            definitions: [
                {
                    name: "prop0",
                    definition: {
                        type: String_,
                        defined: true,
                        nullable: true,
                        optional: true,
                    },
                },
                {
                    name: "schemaProp",
                    definition: {
                        type: s1,
                        defined: true,
                        nullable: true,
                        optional: false,
                    },
                },
            ],
        };
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
                            "string" +
                            ReprDefinitions.DELIMETER +
                            ReprDefinitions.NULL +
                            ReprDefinitions.DELIMETER +
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
                            "string" +
                            ReprDefinitions.DELIMETER +
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
                            ReprDefinitions.DELIMETER +
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
    },
};

export default unitTest;