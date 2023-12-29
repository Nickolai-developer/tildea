import { eqDeep } from "../utils.js";

export interface UnitTest {
    name: string;
    test: () => void;
    errors: Map<number, Error>;
}

export class Clock {
    private index: number = 0;
    private errors: Map<number, Error>;

    private static EQ = "Not equal";

    constructor(errors: Map<number, Error>) {
        this.errors = errors;
    }

    assertEqual(val1: any, val2: any) {
        if (!eqDeep(val1, val2)) {
            this.errors.set(
                this.index,
                new Error(Clock.EQ, { cause: [val1, val2] }),
            );
        }
        this.index++;
    }
}

export const runUnitTests = (tests: UnitTest[]) => {
    console.log("Running unit tests!");
    for (const test of tests) {
        try {
            console.log(`Running ${test.name}...`);
            test.test();
        } catch (e: any) {
            console.error(`Got an error in test ${test.name}.`);
            console.error(e);
        }
    }
};
