import { Int, String_ } from "../constants.js";
import EitherType from "../entities/either.js";
import Schema from "../entities/schema.js";
import { SchemaValidationResult } from "../interfaces.js";
import { ReprDefinitions } from "../validation/repr.js";
import validateSchema from "../validation/validate-schema.js";
import { Clock, UnitTest } from "./common.js";

const unitTest: UnitTest = {
    name: "validate-schema-advanced",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);
        const s04 = new Schema({
            name: "S04",
            props: [
                {
                    name: "a",
                    type: Int,
                },
                {
                    name: "b",
                    type: String_,
                },
            ],
        });
        const s14 = new Schema({
            name: "S14",
            props: [
                {
                    name: "b",
                    type: Int,
                },
                {
                    name: "a",
                    type: String_,
                },
            ],
        });
        const s4 = new Schema({
            name: "S4",
            props: [
                {
                    name: "prop1",
                    type: new EitherType({
                        types: [Int, String_, s04, s14],
                    }),
                },
            ],
        });
        clock.assertEqual(validateSchema({ prop1: 0 }, s4, {}), {
            errors: null,
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: "0" }, s4, {}), {
            errors: null,
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: true }, s4, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: s4.props[0].type.repr({}),
                    found: "boolean",
                },
            ],
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: {} }, s4, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: s4.props[0].type.repr({}),
                    found: ReprDefinitions.OBJECT,
                    subproperties: [
                        {
                            name: "a",
                            expected: Int.repr({}),
                            found: ReprDefinitions.UNDEFINED,
                        },
                        {
                            name: "b",
                            expected: String_.repr({}),
                            found: ReprDefinitions.UNDEFINED,
                        },
                    ],
                },
            ],
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: { a: 0 } }, s4, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: s4.props[0].type.repr({}),
                    found: ReprDefinitions.OBJECT,
                    subproperties: [
                        {
                            name: "b",
                            expected: String_.repr({}),
                            found: ReprDefinitions.UNDEFINED,
                        },
                    ],
                },
            ],
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: { a: "0" } }, s4, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: s4.props[0].type.repr({}),
                    found: ReprDefinitions.OBJECT,
                    subproperties: [
                        {
                            name: "b",
                            expected: Int.repr({}),
                            found: ReprDefinitions.UNDEFINED,
                        },
                    ],
                },
            ],
        } as SchemaValidationResult);
    },
};

export default unitTest;
