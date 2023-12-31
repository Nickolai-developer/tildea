import { Int, String_ } from "../constants.js";
import ArrayType from "../entities/array.js";
import EitherType from "../entities/either.js";
import StaticArrayType from "../entities/static-array.js";
import {
    NullableOptions,
    ReprOptions,
    ScalarDefinition,
} from "../interfaces.js";
import { ReprDefinitions, nullableRepr, typeRepr } from "../validation/repr.js";
import { Clock, UnitTest } from "./common.js";

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
        clock.assertEqual(typeRepr(defString, opts1), "String");

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

        const arrType0 = new ArrayType({
            elemDefinition: {
                type: Int,
                nullableOptions: null0,
            },
        });
        const arrType1 = new ArrayType({
            elemDefinition: {
                type: Int,
                nullableOptions: {
                    defined: false,
                    nullable: false,
                    optional: false,
                },
            },
        });
        const arrType2 = new ArrayType({
            elemDefinition: {
                type: Int,
                nullableOptions: {
                    defined: false,
                    nullable: true,
                    optional: true,
                },
            },
        });
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

        const sArray0 = new StaticArrayType({
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
        });
        sArray0.name = "StaticArrayProperties";
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
            "StaticArrayProperties" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL,
        );
        sArray0.name = undefined;
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
                "String" +
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
                "String" +
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

        const e0 = new EitherType({
            types: [Int, String_],
            name: "EitherType1",
        });
        const e1 = new EitherType({
            types: [Int, String_],
            name: "EitherType1",
        });
        clock.assertEqual(
            typeRepr(
                {
                    type: e0,
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
                    type: e1,
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
        e0.name = undefined;
        clock.assertEqual(
            typeRepr(
                {
                    type: new EitherType({
                        types: [Int, String_, e0],
                    }),
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
                "String" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ")",
        );
    },
};

export default unitTest;
