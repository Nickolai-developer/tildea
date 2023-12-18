import { nullableDefaults } from "../constants.js";
import {
    TildaSchema,
    SchemaValidationResult,
    TildaScalarType,
} from "../interfaces.js";
import { ReprDefinitions } from "../repr.js";
import validateSchema from "../validate-schema.js";
import { Clock, UnitTest } from "./common.js";

const Any: TildaScalarType = {
    _tildaEntityType: "scalar",
    name: "Any",
    validate: () => true,
};

const Int: TildaScalarType = {
    _tildaEntityType: "scalar",
    name: "Int",
    validate: val => Number.isInteger(val),
};

const String_: TildaScalarType = {
    _tildaEntityType: "scalar",
    name: "string",
    validate: val => typeof val === "string",
};

const unitTest: UnitTest = {
    name: "validate-schema-intermediate",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);
        const s0: TildaSchema = {
            _tildaEntityType: "schema",
            name: "S0",
            definitions: [
                {
                    name: "a",
                    definition: {
                        type: Any,
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        };
        clock.assertEqual(validateSchema({ a: [1, 2, 3, 4] }, s0, {}), {
            errors: null,
        });

        const s1: TildaSchema = {
            _tildaEntityType: "schema",
            name: "S1",
            definitions: [
                {
                    name: "a",
                    definition: {
                        type: {
                            _tildaEntityType: "array",
                            elemDefinition: {
                                type: Int,
                                nullableOptions: {
                                    ...nullableDefaults,
                                    nullable: true,
                                },
                            },
                        },
                        nullableOptions: nullableDefaults,
                    },
                },
                {
                    name: "b",
                    definition: {
                        type: {
                            _tildaEntityType: "array",
                            elemDefinition: {
                                type: {
                                    _tildaEntityType: "array",
                                    elemDefinition: {
                                        type: Int,
                                        nullableOptions: nullableDefaults,
                                    },
                                },
                                nullableOptions: {
                                    ...nullableDefaults,
                                    nullable: true,
                                },
                            },
                        },
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        };
        clock.assertEqual(
            validateSchema(
                {
                    a: [1, 2, 3, 4, 5, null, null, null, 7],
                    b: [[1, 2, 3], [4, 5, 6], null, [7, 8, 9]],
                },
                s1,
                {},
            ),
            { errors: null } as SchemaValidationResult,
        );
        clock.assertEqual(
            validateSchema(
                {
                    a: [4, 5, null, null, null, 7, "1", 0, undefined, 8],
                    b: [[1, 2, 3], [null, 5, 6], null, [7, 8, 9]],
                },
                s1,
                {},
            ),
            {
                errors: [
                    {
                        name: "a",
                        found: ReprDefinitions.OBJECT,
                        expected:
                            "(Int" +
                            ReprDefinitions.DELIM_OR +
                            ReprDefinitions.NULL +
                            ")[]",
                        subproperties: [
                            {
                                name: "6",
                                expected:
                                    "Int" +
                                    ReprDefinitions.DELIM_OR +
                                    ReprDefinitions.NULL,
                                found: "string",
                            },
                            {
                                name: "8",
                                expected:
                                    "Int" +
                                    ReprDefinitions.DELIM_OR +
                                    ReprDefinitions.NULL,
                                found: ReprDefinitions.UNDEFINED,
                            },
                        ],
                    },
                    {
                        name: "b",
                        found: ReprDefinitions.OBJECT,
                        expected: `(Int[]${ReprDefinitions.DELIM_OR}${ReprDefinitions.NULL})[]`,
                        subproperties: [
                            {
                                name: "1",
                                found: ReprDefinitions.OBJECT,
                                expected: `Int[]${ReprDefinitions.DELIM_OR}${ReprDefinitions.NULL}`,
                                subproperties: [
                                    {
                                        name: "0",
                                        expected: "Int",
                                        found: ReprDefinitions.NULL,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            } as SchemaValidationResult,
        );

        const s2: TildaSchema = {
            _tildaEntityType: "schema",
            name: "S2",
            definitions: [
                {
                    name: "a",
                    definition: {
                        type: {
                            _tildaEntityType: "array",
                            elemDefinition: {
                                type: Int,
                                nullableOptions: nullableDefaults,
                            },
                        },
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        };
        const arr0 = [1, 2, 3, 4];
        (arr0 as any).prop0 = 6;
        clock.assertEqual(validateSchema({ a: arr0 }, s2, {}), {
            errors: [
                {
                    name: "a",
                    expected: "Int[]",
                    found: ReprDefinitions.OBJECT,
                    subproperties: [
                        {
                            name: "prop0",
                            expected: ReprDefinitions.UNDEFINED,
                            found: "number",
                        },
                    ],
                },
            ],
        } as SchemaValidationResult);
        clock.assertEqual(
            validateSchema({ a: arr0 }, s2, {
                hasPropertyCheck: true,
                useValue: true,
            }),
            {
                errors: [
                    {
                        name: "a",
                        expected: "Int[]",
                        found: ReprDefinitions.OBJECT,
                        subproperties: [
                            {
                                name: "prop0",
                                expected: ReprDefinitions.NO_PROPERTY,
                                found: "6",
                            },
                        ],
                    },
                ],
            } as SchemaValidationResult,
        );

        const s3: TildaSchema = {
            _tildaEntityType: "schema",
            name: "S3",
            definitions: [
                {
                    name: "prop1",
                    definition: {
                        type: {
                            _tildaEntityType: "staticArray",
                            types: [
                                {
                                    type: Int,
                                    nullableOptions: {
                                        ...nullableDefaults,
                                        nullable: true,
                                    },
                                },
                                {
                                    type: String_,
                                    nullableOptions: {
                                        ...nullableDefaults,
                                        defined: false,
                                    },
                                },
                                {
                                    type: {
                                        _tildaEntityType: "staticArray",
                                        types: [
                                            {
                                                type: Int,
                                                nullableOptions:
                                                    nullableDefaults,
                                            },
                                            {
                                                type: {
                                                    _tildaEntityType:
                                                        "staticArray",
                                                    name: "StaticArray1",
                                                    types: [
                                                        {
                                                            type: Int,
                                                            nullableOptions:
                                                                nullableDefaults,
                                                        },
                                                        {
                                                            type: Int,
                                                            nullableOptions:
                                                                nullableDefaults,
                                                        },
                                                    ],
                                                },
                                                nullableOptions:
                                                    nullableDefaults,
                                            },
                                        ],
                                    },
                                    nullableOptions: nullableDefaults,
                                },
                            ],
                        },
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        };
        clock.assertEqual(
            validateSchema({ prop1: [0, "", [0, [0, 0]]] }, s3, {}),
            {
                errors: null,
            } as SchemaValidationResult,
        );
        clock.assertEqual(
            validateSchema({ prop1: [null, undefined, [0, [0, 0]]] }, s3, {}),
            {
                errors: null,
            } as SchemaValidationResult,
        );
        clock.assertEqual(
            validateSchema(
                { prop1: [undefined, [undefined], [null, [null]]] },
                s3,
                {},
            ),
            {
                errors: [
                    {
                        name: "prop1",
                        expected: `[Int${ReprDefinitions.DELIM_OR}${ReprDefinitions.NULL}${ReprDefinitions.DELIM_COLON}string${ReprDefinitions.DELIM_OR}${ReprDefinitions.UNDEFINED}${ReprDefinitions.DELIM_COLON}[Int${ReprDefinitions.DELIM_COLON}StaticArray1]]`,
                        found: ReprDefinitions.OBJECT,
                        subproperties: [
                            {
                                name: "0",
                                expected: `Int${ReprDefinitions.DELIM_OR}${ReprDefinitions.NULL}`,
                                found: ReprDefinitions.UNDEFINED,
                            },
                            {
                                name: "1",
                                expected: `string${ReprDefinitions.DELIM_OR}${ReprDefinitions.UNDEFINED}`,
                                found: ReprDefinitions.OBJECT,
                            },
                            {
                                name: "2",
                                expected: `[Int${ReprDefinitions.DELIM_COLON}StaticArray1]`,
                                found: ReprDefinitions.OBJECT,
                                subproperties: [
                                    {
                                        name: "0",
                                        expected: "Int",
                                        found: ReprDefinitions.NULL,
                                    },
                                    {
                                        name: "1",
                                        expected: "StaticArray1",
                                        found: ReprDefinitions.OBJECT,
                                        subproperties: [
                                            {
                                                name: "0",
                                                expected: "Int",
                                                found: ReprDefinitions.NULL,
                                            },
                                            {
                                                name: "1",
                                                expected: "Int",
                                                found: ReprDefinitions.UNDEFINED,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            } as SchemaValidationResult,
        );
        clock.assertEqual(
            validateSchema(
                { prop1: [undefined, [undefined], [null, [null]], 5] },
                s3,
                { hasPropertyCheck: true },
            ),
            {
                errors: [
                    {
                        name: "prop1",
                        expected: `[Int${ReprDefinitions.DELIM_OR}${ReprDefinitions.NULL}${ReprDefinitions.DELIM_COLON}string${ReprDefinitions.DELIM_OR}${ReprDefinitions.UNDEFINED}${ReprDefinitions.DELIM_COLON}[Int${ReprDefinitions.DELIM_COLON}StaticArray1]]`,
                        found: ReprDefinitions.OBJECT,
                        subproperties: [
                            {
                                name: "0",
                                expected: `Int${ReprDefinitions.DELIM_OR}${ReprDefinitions.NULL}`,
                                found: ReprDefinitions.UNDEFINED,
                            },
                            {
                                name: "1",
                                expected: `string${ReprDefinitions.DELIM_OR}${ReprDefinitions.UNDEFINED}`,
                                found: ReprDefinitions.OBJECT,
                            },
                            {
                                name: "2",
                                expected: `[Int${ReprDefinitions.DELIM_COLON}StaticArray1]`,
                                found: ReprDefinitions.OBJECT,
                                subproperties: [
                                    {
                                        name: "0",
                                        expected: "Int",
                                        found: ReprDefinitions.NULL,
                                    },
                                    {
                                        name: "1",
                                        expected: "StaticArray1",
                                        found: ReprDefinitions.OBJECT,
                                        subproperties: [
                                            {
                                                name: "0",
                                                expected: "Int",
                                                found: ReprDefinitions.NULL,
                                            },
                                            {
                                                name: "1",
                                                expected: "Int",
                                                found: ReprDefinitions.NO_PROPERTY,
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                name: "3",
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
