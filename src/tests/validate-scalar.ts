import { NullableOptions, ReprOptions, ScalarDefinition } from "../interfaces.js";
import { ReprDefinitions } from "../repr.js";
import TildaScalarType from "../tilda-scalar-type.js";
import validateScalar from "../validate-scalar.js";
import { Clock, UnitTest } from "./common.js";

const String_ = new TildaScalarType({
    repr: "string",
    validate: val => typeof val === "string",
});

const Int = new TildaScalarType({
    repr: "Int",
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

const opts2: ReprOptions = {
    hasPropertyCheck: false,
    useValue: true,
};

const opts3: ReprOptions = {
    hasPropertyCheck: true,
    useValue: true,
};

const unitTest: UnitTest = {
    name: "validate-scalar",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);
        clock.assertEqual(validateScalar(0, defInt, opts0), null);
        clock.assertEqual(validateScalar("0", defInt, opts0), {
            expected: "Int",
            found: "string",
        });
        clock.assertEqual(validateScalar("0", defInt, opts2), {
            expected: "Int",
            found: '"0"',
        });
        clock.assertEqual(validateScalar(0, defString, opts2), {
            expected: "string",
            found: "0",
        });

        clock.assertEqual(validateScalar({ a: 1 }, "a", defInt, opts3), null);
        clock.assertEqual(
            validateScalar(
                { a: undefined },
                "a",
                { ...defInt, nullable: true },
                opts1,
            ),
            {
                expected:
                    "Int" + ReprDefinitions.DELIMETER + ReprDefinitions.NULL,
                found: ReprDefinitions.UNDEFINED,
            },
        );
        clock.assertEqual(
            validateScalar({}, "a", { ...defInt, nullable: true }, opts1),
            {
                expected:
                    "Int" + ReprDefinitions.DELIMETER + ReprDefinitions.NULL,
                found: ReprDefinitions.NO_PROPERTY,
            },
        );
        clock.assertEqual(
            validateScalar({}, "a", { ...defInt, nullable: true }, opts0),
            {
                expected:
                    "Int" + ReprDefinitions.DELIMETER + ReprDefinitions.NULL,
                found: ReprDefinitions.UNDEFINED,
            },
        );

        clock.assertEqual(
            validateScalar(
                { a: "" },
                "a",
                { ...defInt, nullable: true, optional: true, defined: false },
                opts3,
            ),
            {
                expected:
                    "Int" +
                    ReprDefinitions.DELIMETER +
                    ReprDefinitions.NULL +
                    ReprDefinitions.DELIMETER +
                    ReprDefinitions.UNDEFINED +
                    ReprDefinitions.DELIMETER +
                    ReprDefinitions.NO_PROPERTY,
                found: '""',
            },
        );
    },
};

export default unitTest;
