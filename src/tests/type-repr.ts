import {
    NullableOptions,
    ReprOptions,
    ScalarDefinition,
    TildaArrayType,
    TildaEitherType,
    TildaStaticArray,
} from "../interfaces.js";
import { ReprDefinitions, typeRepr } from "../repr.js";
import TildaScalarType from "../tilda-scalar-type.js";
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

const defInt: ScalarDefinition = {
    type: Int,
    ...null0,
};

const defString: ScalarDefinition = {
    type: String_,
    ...null0,
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
        clock.assertEqual(typeRepr(null0, opts0), "");
        clock.assertEqual(typeRepr(defInt, opts0), "Int");
        clock.assertEqual(typeRepr(null0, opts1), "");
        clock.assertEqual(typeRepr(defString, opts1), "string");

        clock.assertEqual(
            typeRepr({ ...null0, defined: false }, opts0),
            ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            typeRepr({ ...null0, nullable: true }, opts0),
            ReprDefinitions.NULL,
        );
        clock.assertEqual(typeRepr({ ...null0, optional: true }, opts0), "");
        clock.assertEqual(
            typeRepr({ ...null0, optional: true }, opts1),
            ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            typeRepr({ ...null0, defined: false, nullable: true }, opts0),
            ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            typeRepr({ ...null0, defined: false, optional: true }, opts0),
            ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            typeRepr({ ...null0, defined: false, optional: true }, opts1),
            ReprDefinitions.UNDEFINED +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            typeRepr({ ...null0, nullable: true, optional: true }, opts0),
            ReprDefinitions.NULL,
        );
        clock.assertEqual(
            typeRepr({ ...null0, nullable: true, optional: true }, opts1),
            ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            typeRepr(
                { ...null0, defined: false, nullable: true, optional: true },
                opts0,
            ),
            ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            typeRepr(
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
            typeRepr({ ...defInt, defined: false }, opts0),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            typeRepr({ ...defInt, nullable: true }, opts0),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.NULL,
        );
        clock.assertEqual(
            typeRepr({ ...defInt, optional: true }, opts0),
            "Int",
        );
        clock.assertEqual(
            typeRepr({ ...defInt, optional: true }, opts1),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            typeRepr({ ...defInt, defined: false, nullable: true }, opts0),
            "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            typeRepr({ ...defInt, defined: false, optional: true }, opts0),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            typeRepr({ ...defInt, defined: false, optional: true }, opts1),
            "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            typeRepr({ ...defInt, nullable: true, optional: true }, opts0),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.NULL,
        );
        clock.assertEqual(
            typeRepr({ ...defInt, nullable: true, optional: true }, opts1),
            "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            typeRepr(
                { ...defInt, defined: false, nullable: true, optional: true },
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
                { ...defInt, defined: false, nullable: true, optional: true },
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
                ...null0,
            },
        };
        const arrType1: TildaArrayType = {
            _tildaEntityType: "array",
            elemDefinition: {
                type: Int,
                defined: false,
                nullable: false,
                optional: false,
            },
        };
        const arrType2: TildaArrayType = {
            _tildaEntityType: "array",
            elemDefinition: {
                type: Int,
                defined: false,
                nullable: true,
                optional: true,
            },
        };
        clock.assertEqual(
            typeRepr({ type: arrType0, ...null0 }, { hasPropertyCheck: true }),
            "Int[]",
        );
        clock.assertEqual(
            typeRepr(
                {
                    type: arrType0,
                    defined: true,
                    nullable: true,
                    optional: false,
                },
                { hasPropertyCheck: true },
            ),
            "Int[]" + ReprDefinitions.DELIM_OR + ReprDefinitions.NULL,
        );
        clock.assertEqual(
            typeRepr(
                {
                    type: arrType1,
                    defined: true,
                    nullable: true,
                    optional: false,
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
                    defined: true,
                    nullable: true,
                    optional: false,
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
                    defined: true,
                    nullable: true,
                    optional: false,
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

        const sArray0: TildaStaticArray = {
            _tildaEntityType: "staticArray",
            types: [
                { type: Int, ...null0 },
                { type: String_, ...null0 },
                { type: Int, defined: true, nullable: true, optional: true },
            ],
        };
        clock.assertEqual(
            typeRepr(
                {
                    type: { ...sArray0, name: "StaticArrayProperties" },
                    defined: true,
                    nullable: true,
                    optional: false,
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
                    defined: true,
                    nullable: true,
                    optional: false,
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
                    defined: true,
                    nullable: true,
                    optional: false,
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
                    defined: true,
                    nullable: true,
                    optional: false,
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
                    defined: false,
                    nullable: true,
                    optional: false,
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
                    defined: false,
                    nullable: true,
                    optional: false,
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
