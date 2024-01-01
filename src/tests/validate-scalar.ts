import { UnitTest } from "./common.js";

// const opts0: ReprOptions = {
//     hasPropertyCheck: false,
// };

// const opts1: ReprOptions = {
//     hasPropertyCheck: true,
// };

// const opts2: ReprOptions = {
//     hasPropertyCheck: false,
//     useValue: true,
// };

// const opts3: ReprOptions = {
//     hasPropertyCheck: true,
//     useValue: true,
// };

const unitTest: UnitTest = {
    name: "validate-scalar",
    errors: new Map(),
    test() {
        // const clock = new Clock(this.errors);
        // clock.assertEqual(validateScalar({ key: 0 }, "key", Int, opts0), null);
        // clock.assertEqual(validateScalar({ key: "0" }, "key", Int, opts0), {
        //     expected: "Int",
        //     found: "string",
        // });
        // clock.assertEqual(validateScalar({ key: "0" }, "key", Int, opts2), {
        //     expected: "Int",
        //     found: '"0"',
        // });
        // clock.assertEqual(validateScalar({ key: 0 }, "key", String_, opts2), {
        //     expected: "String",
        //     found: "0",
        // });
        // clock.assertEqual(validateScalar({ a: 1 }, "a", Int, opts3), null);
        // clock.assertEqual(
        //     validateScalar(
        //         { a: undefined },
        //         "a",
        //         Int.opts({ nullable: true }) as ScalarType,
        //         opts1,
        //     ),
        //     {
        //         expected:
        //             "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.NULL,
        //         found: ReprDefinitions.UNDEFINED,
        //     },
        // );
        // clock.assertEqual(
        //     validateScalar(
        //         {},
        //         "a",
        //         Int.opts({ nullable: true }) as ScalarType,
        //         opts1,
        //     ),
        //     {
        //         expected:
        //             "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.NULL,
        //         found: ReprDefinitions.NO_PROPERTY,
        //     },
        // );
        // clock.assertEqual(
        //     validateScalar(
        //         {},
        //         "a",
        //         Int.opts({ nullable: true }) as ScalarType,
        //         opts0,
        //     ),
        //     {
        //         expected:
        //             "Int" + ReprDefinitions.DELIM_OR + ReprDefinitions.NULL,
        //         found: ReprDefinitions.UNDEFINED,
        //     },
        // );
        // useOptions(opts3);
        // clock.assertEqual(
        //     validateScalar(
        //         { a: "" },
        //         "a",
        //         Int.opts({
        //             nullable: true,
        //             optional: true,
        //             defined: false,
        //         }) as ScalarType,
        //         opts3,
        //     ),
        //     {
        //         expected:
        //             "Int" +
        //             ReprDefinitions.DELIM_OR +
        //             ReprDefinitions.NULL +
        //             ReprDefinitions.DELIM_OR +
        //             ReprDefinitions.UNDEFINED +
        //             ReprDefinitions.DELIM_OR +
        //             ReprDefinitions.NO_PROPERTY,
        //         found: '""',
        //     },
        // );
    },
};

export default unitTest;
