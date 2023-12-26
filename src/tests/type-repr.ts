import {
    NullableOptions,
    ReprOptions,
    ScalarDefinition,
    TildaArrayType,
    TildaEitherType,
    TildaScalarType,
    TildaStaticArrayType,
} from "../interfaces.js";
import { ReprDefinitions, nullableRepr, typeRepr } from "../validation/repr.js";
import { Clock, UnitTest } from "./common.js";

const String_: TildaScalarType = {
    _tildaEntityType: "scalar",
    name: "string",
    validate: val => typeof val === "string",
};

const Int: TildaScalarType = {
    _tildaEntityType: "scalar",
    name: "Int",
    validate: val => Number.isInteger(val),
};

const null0: NullableOptions = {
    defined: true,
    nullable: false,
    optional: false,
};

const defInt: ScalarDefinition = {
    type: Int,
    nullableOptions: null0,
};

const defString: ScalarDefinition = {
    type: String_,
    nullableOptions: null0,
};

const opts0: ReprOptions = {
    hasPropertyCheck: false,
};

const opts1: ReprOptions = {
    hasPropertyCheck: true,
};

const unitTest: UnitTest = {
    name: "type-repr",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);
        clock.assertEqual(nullableRepr(null0, opts0), "");
        clock.assertEqual(typeRepr(defInt, opts0), "Int");
        clock.assertEqual(nullableRepr(null0, opts1), "");
        clock.assertEqual(typeRepr(defString, opts1), "string");

        clock.assertEqual(
            nullableRepr({ ...null0, defined: false }, opts0),
            ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            nullableRepr({ ...null0, nullable: true }, opts0),
            ReprDefinitions.NULL,
        );
        clock.assertEqual(
            nullableRepr({ ...null0, optional: true }, opts0),
            "",
        );
        clock.assertEqual(
            nullableRepr({ ...null0, optional: true }, opts1),
            ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            nullableRepr({ ...null0, defined: false, nullable: true }, opts0),
            ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            nullableRepr({ ...null0, defined: false, optional: true }, opts0),
            ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            nullableRepr({ ...null0, defined: false, optional: true }, opts1),
            ReprDefinitions.UNDEFINED +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            nullableRepr({ ...null0, nullable: true, optional: true }, opts0),
            ReprDefinitions.NULL,
        );
        clock.assertEqual(
            nullableRepr({ ...null0, nullable: true, optional: true }, opts1),
            ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            nullableRepr(
                { ...null0, defined: false, nullable: true, optional: true },
                opts0,
            ),
            ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            nullableRepr(
                { ...null0, defined: false, nullable: true, optional: true },
                opts1,
            ),
            ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY,
        );

        clock.assertEqual(
            typeRepr(
                { ...defInt, nullableOptions: { ...null0, defined: false } },
                opts0,
            ),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            typeRepr(
                { ...defInt, nullableOptions: { ...null0, nullable: true } },
                opts0,
            ),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.NULL,
        );
        clock.assertEqual(
            typeRepr(
                { ...defInt, nullableOptions: { ...null0, optional: true } },
                opts0,
            ),
            "Int",
        );
        clock.assertEqual(
            typeRepr(
                { ...defInt, nullableOptions: { ...null0, optional: true } },
                opts1,
            ),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            typeRepr(
                {
                    ...defInt,
                    nullableOptions: {
                        ...null0,
                        defined: false,
                        nullable: true,
                    },
                },
                opts0,
            ),
            "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            typeRepr(
                {
                    ...defInt,
                    nullableOptions: {
                        ...null0,
                        defined: false,
                        optional: true,
                    },
                },
                opts0,
            ),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            typeRepr(
                {
                    ...defInt,
                    nullableOptions: {
                        ...null0,
                        defined: false,
                        optional: true,
                    },
                },
                opts1,
            ),
            "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            typeRepr(
                {
                    ...defInt,
                    nullableOptions: {
                        ...null0,
                        nullable: true,
                        optional: true,
                    },
                },
                opts0,
            ),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.NULL,
        );
        clock.assertEqual(
            typeRepr(
                {
                    ...defInt,
                    nullableOptions: {
                        ...null0,
                        nullable: true,
                        optional: true,
                    },
                },
                opts1,
            ),
            "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            typeRepr(
                {
                    ...defInt,
                    nullableOptions: {
                        defined: false,
                        nullable: true,
                        optional: true,
                    },
                },
                opts0,
            ),
            "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            typeRepr(
                {
                    ...defInt,
                    nullableOptions: {
                        defined: false,
                        nullable: true,
                        optional: true,
                    },
                },
                opts1,
            ),
            "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY,
        );

        const arrType0: TildaArrayType = {
            _tildaEntityType: "array",
            elemDefinition: {
                type: Int,
                nullableOptions: null0,
            },
        };
        const arrType1: TildaArrayType = {
            _tildaEntityType: "array",
            elemDefinition: {
                type: Int,
                nullableOptions: {
                    defined: false,
                    nullable: false,
                    optional: false,
                },
            },
        };
        const arrType2: TildaArrayType = {
            _tildaEntityType: "array",
            elemDefinition: {
                type: Int,
                nullableOptions: {
                    defined: false,
                    nullable: true,
                    optional: true,
                },
            },
        };
        clock.assertEqual(
            typeRepr(
                { type: arrType0, nullableOptions: null0 },
                { hasPropertyCheck: true },
            ),
            "Int[]",
        );
        clock.assertEqual(
            typeRepr(
                {
                    type: arrType0,
                    nullableOptions: {
                        defined: true,
                        nullable: true,
                        optional: false,
                    },
                },
                { hasPropertyCheck: true },
            ),
            "Int[]" + ReprDefinitions.DELIM_OR + ReprDefinitions.NULL,
        );
        clock.assertEqual(
            typeRepr(
                {
                    type: arrType1,
                    nullableOptions: {
                        defined: true,
                        nullable: true,
                        optional: false,
                    },
                },
                { hasPropertyCheck: true },
            ),
            "(Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ")[]" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL,
        );
        clock.assertEqual(
            typeRepr(
                {
                    type: arrType2,
                    nullableOptions: {
                        defined: true,
                        nullable: true,
                        optional: false,
                    },
                },
                { hasPropertyCheck: false },
            ),
            "(Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ")[]" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL,
        );
        clock.assertEqual(
            typeRepr(
                {
                    type: arrType2,
                    nullableOptions: {
                        defined: true,
                        nullable: true,
                        optional: false,
                    },
                },
                { hasPropertyCheck: true },
            ),
            "(Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY +
                ")[]" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL,
        );

        const sArray0: TildaStaticArrayType = {
            _tildaEntityType: "staticArray",
            types: [
                { type: Int, nullableOptions: null0 },
                { type: String_, nullableOptions: null0 },
                {
                    type: Int,
                    nullableOptions: {
                        defined: true,
                        nullable: true,
                        optional: true,
                    },
                },
            ],
        };
        clock.assertEqual(
            typeRepr(
                {
                    type: { ...sArray0, name: "StaticArrayProperties" },
                    nullableOptions: {
                        defined: true,
                        nullable: true,
                        optional: false,
                    },
                },
                { hasPropertyCheck: false },
            ),
            "StaticArrayProperties" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL,
        );
        clock.assertEqual(
            typeRepr(
                {
                    type: sArray0,
                    nullableOptions: {
                        defined: true,
                        nullable: true,
                        optional: false,
                    },
                },
                { hasPropertyCheck: false },
            ),
            "[Int" +
                ReprDefinitions.DELIM_COLON +
                "string" +
                ReprDefinitions.DELIM_COLON +
                "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                "]" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL,
        );
        clock.assertEqual(
            typeRepr(
                {
                    type: sArray0,
                    nullableOptions: {
                        defined: true,
                        nullable: true,
                        optional: false,
                    },
                },
                { hasPropertyCheck: true },
            ),
            "[Int" +
                ReprDefinitions.DELIM_COLON +
                "string" +
                ReprDefinitions.DELIM_COLON +
                "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY +
                "]" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL,
        );

        const e0: TildaEitherType = {
            _tildaEntityType: "either",
            types: [Int, String_],
        };
        const e1: TildaEitherType = {
            _tildaEntityType: "either",
            types: [Int, String_],
        };
        clock.assertEqual(
            typeRepr(
                {
                    type: { ...e0, name: "EitherType1" },
                    nullableOptions: {
                        defined: true,
                        nullable: true,
                        optional: false,
                    },
                },
                { hasPropertyCheck: false },
            ),
            "(EitherType1" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ")",
        );
        clock.assertEqual(
            typeRepr(
                {
                    type: { ...e1, name: "EitherType1" },
                    nullableOptions: {
                        defined: false,
                        nullable: true,
                        optional: false,
                    },
                },
                { hasPropertyCheck: false },
            ),
            "(EitherType1" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ")",
        );
        clock.assertEqual(
            typeRepr(
                {
                    type: {
                        _tildaEntityType: "either",
                        types: [Int, String_, e0],
                    },
                    nullableOptions: {
                        defined: false,
                        nullable: true,
                        optional: false,
                    },
                },
                { hasPropertyCheck: false },
            ),
            "(Int" +
                ReprDefinitions.DELIM_OR +
                "string" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ")",
        );
    },
};

export default unitTest;
