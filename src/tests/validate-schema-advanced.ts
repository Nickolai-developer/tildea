import { nullableDefaults } from "../constants.js";
import { Schema } from "../interfaces.js";
import { ReprDefinitions } from "../repr.js";
import TildaScalarType from "../tilda-scalar-type.js";
import validateSchema from "../validate-schema.js";
import { Clock, UnitTest } from "./common.js";

const Int = new TildaScalarType({
    name: "Int",
    validate: val => Number.isInteger(val),
});

const String_ = new TildaScalarType({
    name: "string",
    validate: val => typeof val === "string",
});

const unitTest: UnitTest = {
    name: "validate-schema-advanced",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);
        const s04: Schema = {
            _tildaEntityType: "schema",
            name: "S04",
            definitions: [
                {
                    name: "a",
                    definition: {
                        type: Int,
                        nullableOptions: nullableDefaults,
                    },
                },
                {
                    name: "b",
                    definition: {
                        type: String_,
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        };
        const s14: Schema = {
            _tildaEntityType: "schema",
            name: "S14",
            definitions: [
                {
                    name: "b",
                    definition: {
                        type: Int,
                        nullableOptions: nullableDefaults,
                    },
                },
                {
                    name: "a",
                    definition: {
                        type: String_,
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        };
        const s4: Schema = {
            _tildaEntityType: "schema",
            name: "S4",
            definitions: [
                {
                    name: "prop1",
                    definition: {
                        type: {
                            _tildaEntityType: "either",
                            types: [Int, String_, s04, s14],
                        },
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        };
        console.log(validateSchema({ prop1: { a: "" } }, s4, {}));
    },
};

export default unitTest;
