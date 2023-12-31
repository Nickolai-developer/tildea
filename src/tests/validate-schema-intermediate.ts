import { Any, Int, String_, nullableDefaults } from "../constants.js";
import ArrayType from "../entities/array.js";
import Schema from "../entities/schema.js";
import StaticArrayType from "../entities/static-array.js";
import { SchemaValidationResult } from "../interfaces.js";
import { ReprDefinitions } from "../validation/repr.js";
import validateSchema from "../validation/validate-schema.js";
import { Clock, UnitTest } from "./common.js";

const unitTest: UnitTest = {
    name: "validate-schema-intermediate",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);
        const s0 = new Schema({
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
        });
        clock.assertEqual(validateSchema({ a: [1, 2, 3, 4] }, s0, {}), {
            errors: null,
        });

        const s1 = new Schema({
            name: "S1",
            definitions: [
                {
                    name: "a",
                    definition: {
                        type: new ArrayType({
                            elemDefinition: {
                                type: Int,
                                nullableOptions: {
                                    ...nullableDefaults,
                                    nullable: true,
                                },
                            },
                        }),
                        nullableOptions: nullableDefaults,
                    },
                },
                {
                    name: "b",
                    definition: {
                        type: new ArrayType({
                            elemDefinition: {
                                type: new ArrayType({
                                    elemDefinition: {
                                        type: Int,
                                        nullableOptions: nullableDefaults,
                                    },
                                }),
                                nullableOptions: {
                                    ...nullableDefaults,
                                    nullable: true,
                                },
                            },
                        }),
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        });
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

        const s2 = new Schema({
            name: "S2",
            definitions: [
                {
                    name: "a",
                    definition: {
                        type: new ArrayType({
                            elemDefinition: {
                                type: Int,
                                nullableOptions: nullableDefaults,
                            },
                        }),
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        });
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

        const s3 = new Schema({
            name: "S3",
            definitions: [
                {
                    name: "prop1",
                    definition: {
                        type: new StaticArrayType({
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
                                    type: new StaticArrayType({
                                        types: [
                                            {
                                                type: Int,
                                                nullableOptions:
                                                    nullableDefaults,
                                            },
                                            {
                                                type: new StaticArrayType({
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
                                                }),
                                                nullableOptions:
                                                    nullableDefaults,
                                            },
                                        ],
                                    }),
                                    nullableOptions: nullableDefaults,
                                },
                            ],
                        }),
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        });
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
                        expected: `[Int${ReprDefinitions.DELIM_OR}${ReprDefinitions.NULL}${ReprDefinitions.DELIM_COLON}String${ReprDefinitions.DELIM_OR}${ReprDefinitions.UNDEFINED}${ReprDefinitions.DELIM_COLON}[Int${ReprDefinitions.DELIM_COLON}StaticArray1]]`,
                        found: ReprDefinitions.OBJECT,
                        subproperties: [
                            {
                                name: "0",
                                expected: `Int${ReprDefinitions.DELIM_OR}${ReprDefinitions.NULL}`,
                                found: ReprDefinitions.UNDEFINED,
                            },
                            {
                                name: "1",
                                expected: `String${ReprDefinitions.DELIM_OR}${ReprDefinitions.UNDEFINED}`,
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
                        expected: `[Int${ReprDefinitions.DELIM_OR}${ReprDefinitions.NULL}${ReprDefinitions.DELIM_COLON}String${ReprDefinitions.DELIM_OR}${ReprDefinitions.UNDEFINED}${ReprDefinitions.DELIM_COLON}[Int${ReprDefinitions.DELIM_COLON}StaticArray1]]`,
                        found: ReprDefinitions.OBJECT,
                        subproperties: [
                            {
                                name: "0",
                                expected: `Int${ReprDefinitions.DELIM_OR}${ReprDefinitions.NULL}`,
                                found: ReprDefinitions.UNDEFINED,
                            },
                            {
                                name: "1",
                                expected: `String${ReprDefinitions.DELIM_OR}${ReprDefinitions.UNDEFINED}`,
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
