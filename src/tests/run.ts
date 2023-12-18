import { UnitTest, runUnitTests } from "./common.js";
import repr from "./repr.js";
import typeRepr from "./type-repr.js";
import nullable from "./validate-nullable.js";
import scalar from "./validate-scalar.js";
import schemaCommon from "./validate-schema-common.js";
import schemaIntermediate from "./validate-schema-intermediate.js";
import schemaAdvanced from "./validate-schema-advanced.js";

const tests: UnitTest[] = [
    repr,
    typeRepr,
    nullable,
    scalar,
    schemaCommon,
    schemaIntermediate,
    schemaAdvanced,
];

runUnitTests(tests);

const errors = tests
    .map(({ name, errors }) =>
        [...errors].map<[string, number, Error]>(([index, error]) => [
            name,
            index,
            error,
        ]),
    )
    .flat();

for (const [name, index, error] of errors) {
    console.error(
        `Unit \`${name}\` error at assertion with index ${index}:`,
        error.message,
    );
    console.error(JSON.stringify(error.cause, undefined, 2));
    console.log("------------------------------------------------------------");
}

console.log("fin");
