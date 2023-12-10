export interface UnitTest {
    name: string;
    test: () => void;
    errors: Map<number, Error>;
}

const eq = (one: any, other: any): boolean => {
    if (typeof one !== typeof other) {
        return false;
    }
    if (typeof one !== "object") {
        return one === other;
    }
    if (one === null || other === null) {
        return one === other;
    }
    const keys = [...new Set([...Object.keys(one), ...Object.keys(other)])];
    return keys.every(k => eq(one[k], other[k]));
};

export class Clock {
    private index: number = 0;
    private errors: Map<number, Error>;

    private static EQ = "Not equal";

    constructor(errors: Map<number, Error>) {
        this.errors = errors;
    }

    assertEqual(val1: any, val2: any) {
        if (!eq(val1, val2)) {
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
