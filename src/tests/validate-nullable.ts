import { NullableOptions, ReprOptions } from "../interfaces.js";
import { ReprDefinitions, typeRepr } from "../repr.js";
import validateNullable from "../validate-nullable.js";
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
    name: "validate-nullable",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);
        clock.assertEqual(validateNullable(0, null0, {}), null);
        clock.assertEqual(
            validateNullable({}, "a", { ...null0, defined: false }, {}),
            null,
        );
        clock.assertEqual(
            validateNullable(
                {},
                "a",
                { ...null0, optional: false },
                { hasPropertyCheck: true },
            ),
            {
                expected: typeRepr(null0, opts1),
                found: ReprDefinitions.NO_PROPERTY,
            },
        );
        clock.assertEqual(
            validateNullable(
                {},
                "a",
                { ...null0, optional: false },
                { hasPropertyCheck: true, useValue: true },
            ),
            {
                expected: typeRepr(null0, opts1),
                found: ReprDefinitions.NO_PROPERTY,
            },
        );
        clock.assertEqual(
            validateNullable(
                { a: undefined },
                "a",
                { ...null0 },
                { hasPropertyCheck: true, useValue: true },
            ),
            {
                expected: typeRepr(null0, opts1),
                found: ReprDefinitions.UNDEFINED,
            },
        );
        clock.assertEqual(
            validateNullable(
                { a: null },
                "a",
                { ...null0 },
                { hasPropertyCheck: true, useValue: true },
            ),
            {
                expected: typeRepr(null0, opts1),
                found: ReprDefinitions.NULL,
            },
        );

        clock.assertEqual(
            validateNullable(
                { a: 0 },
                "a",
                { ...null0 },
                { hasPropertyCheck: true, useValue: true },
            ),
            null,
        );
    },
};

export default unitTest;
