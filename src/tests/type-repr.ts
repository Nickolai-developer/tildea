import { Int, String_ } from "../constants.js";
import ArrayType from "../entities/array.js";
import EitherType from "../entities/either.js";
import StaticArrayType from "../entities/static-array.js";
import { NullableOptions, ReprOptions } from "../interfaces.js";
import { ReprDefinitions } from "../validation/repr.js";
import { Clock, UnitTest } from "./common.js";

const null0: NullableOptions = {
    defined: true,
    nullable: false,
    optional: false,
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
        clock.assertEqual(Int.repr(opts0), "Int");
        clock.assertEqual(String_.repr(opts1), "String");

        clock.assertEqual(
            Int.opts({ ...null0, defined: false }).repr(opts0),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            Int.opts({ ...null0, nullable: true }).repr(opts0),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.NULL,
        );
        clock.assertEqual(
            Int.opts({ ...null0, optional: true }).repr(opts0),
            "Int",
        );
        clock.assertEqual(
            Int.opts({ ...null0, optional: true }).repr(opts1),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            Int.opts({ ...null0, defined: false, nullable: true }).repr(opts0),
            "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            Int.opts({ ...null0, defined: false, optional: true }).repr(opts0),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            Int.opts({
                ...null0,
                defined: false,
                optional: true,
            }).repr(opts1),
            "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            Int.opts({
                ...null0,
                nullable: true,
                optional: true,
            }).repr(opts0),
            "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.NULL,
        );
        clock.assertEqual(
            Int.opts({
                ...null0,
                nullable: true,
                optional: true,
            }).repr(opts1),
            "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY,
        );
        clock.assertEqual(
            Int.opts({
                defined: false,
                nullable: true,
                optional: true,
            }).repr(opts0),
            "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            Int.opts({
                defined: false,
                nullable: true,
                optional: true,
            }).repr(opts1),
            "Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NO_PROPERTY,
        );

        const arrType0 = new ArrayType({
            elemType: Int,
        });
        const arrType1 = new ArrayType({
            elemType: Int.opts({
                defined: false,
            }),
        });
        const arrType2 = new ArrayType({
            elemType: Int.opts({
                defined: false,
                nullable: true,
                optional: true,
            }),
        });
        clock.assertEqual(arrType0.repr({ hasPropertyCheck: true }), "Int[]");
        clock.assertEqual(
            arrType0
                .opts({
                    defined: true,
                    nullable: true,
                    optional: false,
                })
                .repr({ hasPropertyCheck: true }),
            "Int[]" + ReprDefinitions.DELIM_OR + ReprDefinitions.NULL,
        );
        clock.assertEqual(
            arrType1
                .opts({
                    defined: true,
                    nullable: true,
                    optional: false,
                })
                .repr({ hasPropertyCheck: true }),
            "(Int" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ")[]" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL,
        );
        clock.assertEqual(
            arrType2
                .opts({
                    defined: true,
                    nullable: true,
                    optional: false,
                })
                .repr({ hasPropertyCheck: false }),
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
            arrType2
                .opts({
                    defined: true,
                    nullable: true,
                    optional: false,
                })
                .repr({ hasPropertyCheck: true }),
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
                Int,
                String_,
                Int.opts({
                    defined: true,
                    nullable: true,
                    optional: true,
                }),
            ],
        });
        sArray0.name = "StaticArrayProperties";
        clock.assertEqual(
            sArray0
                .opts({
                    defined: true,
                    nullable: true,
                    optional: false,
                })
                .repr({ hasPropertyCheck: false }),
            "StaticArrayProperties" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL,
        );
        sArray0.name = undefined;
        clock.assertEqual(
            sArray0
                .opts({
                    defined: true,
                    nullable: true,
                    optional: false,
                })
                .repr({ hasPropertyCheck: false }),
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
            sArray0
                .opts({
                    defined: true,
                    nullable: true,
                    optional: false,
                })
                .repr({ hasPropertyCheck: true }),
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
            e0
                .opts({
                    defined: true,
                    nullable: true,
                    optional: false,
                })
                .repr({ hasPropertyCheck: false }),
            "(EitherType1" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ")",
        );
        clock.assertEqual(
            e1
                .opts({
                    defined: false,
                    nullable: true,
                    optional: false,
                })
                .repr({ hasPropertyCheck: false }),
            "(EitherType1" +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.NULL +
                ReprDefinitions.DELIM_OR +
                ReprDefinitions.UNDEFINED +
                ")",
        );
        e0.name = undefined;
        clock.assertEqual(
            new EitherType({
                types: [Int, String_, e0],
            })
                .opts({
                    defined: false,
                    nullable: true,
                    optional: false,
                })
                .repr({ hasPropertyCheck: false }),
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
