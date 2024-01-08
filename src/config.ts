import type { NullableOptions, ReprOptions } from "./index.js";

export const nullableDefaults: NullableOptions = {
    defined: true,
    nullable: false,
    optional: false,
};

export const reprDefaults: ReprOptions = {
    hasPropertyCheck: false,
    useValue: false,
};

export let usedReprOpts: ReprOptions = reprDefaults;

export const useOptions = (options: ReprOptions) => {
    usedReprOpts = options;
};
