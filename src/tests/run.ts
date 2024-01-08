import { UnitTest, runUnitTests } from "./common.js";
import repr from "./repr.js";
import schemaBuilding from "./schema-building.js";
import test from "./test.js";

const tests: UnitTest[] = [repr, schemaBuilding, test];

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
