import { ReprDefinitions, repr } from "../utils.js";
import { Clock, type UnitTest } from "./common.js";

const unitTest: UnitTest = {
    name: "repr",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);
        clock.assertEqual(repr(0, {}), "number");
        clock.assertEqual(repr(1, { useValue: true }), "1");
        clock.assertEqual(repr({}, { useValue: true }), ReprDefinitions.OBJECT);
        clock.assertEqual(repr({}, { useValue: true }), ReprDefinitions.OBJECT);
        clock.assertEqual(repr([], { useValue: true }), ReprDefinitions.OBJECT);

        clock.assertEqual(
            repr({ fieldName: "fieldValue" }, "fieldName", { useValue: true }),
            '"fieldValue"',
        );
        clock.assertEqual(
            repr({ fieldName: "fieldValue" }, "fieldName", { useValue: false }),
            "string",
        );
        clock.assertEqual(
            repr({ fieldName: { a: 1 } }, "fieldName", { useValue: false }),
            ReprDefinitions.OBJECT,
        );

        clock.assertEqual(
            repr({ fieldName: undefined }, "fieldName", { useValue: false }),
            ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            repr({}, "fieldName", { useValue: false, hasPropertyCheck: false }),
            ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            repr({ fieldName: undefined }, "fieldName", {
                useValue: false,
                hasPropertyCheck: true,
            }),
            ReprDefinitions.UNDEFINED,
        );
        clock.assertEqual(
            repr({}, "fieldName", { useValue: false, hasPropertyCheck: true }),
            ReprDefinitions.NO_PROPERTY,
        );

        clock.assertEqual(repr(true, {}), "boolean");
        clock.assertEqual(repr(false, {}), "boolean");
        clock.assertEqual(repr(true, { useValue: true }), "true");
        clock.assertEqual(repr(false, { useValue: true }), "false");
        clock.assertEqual(repr("false", { useValue: true }), '"false"');

        clock.assertEqual(repr(undefined, {}), ReprDefinitions.UNDEFINED);
        clock.assertEqual(
            repr(undefined, { useValue: true }),
            ReprDefinitions.UNDEFINED,
        );

        const bigint: bigint = 900000000000007199254740991n;
        clock.assertEqual(repr(1n, {}), "bigint");
        clock.assertEqual(repr(bigint, {}), "bigint");

        clock.assertEqual(repr(1n, { useValue: true }), "1");
        clock.assertEqual(
            repr(bigint, { useValue: true }),
            "900000000000007199254740991",
        );
    },
};

export default unitTest;
