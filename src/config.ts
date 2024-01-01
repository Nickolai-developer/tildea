import { reprDefaults } from "./constants.js";
import { ReprOptions } from "./interfaces.js";

export let usedReprOpts: ReprOptions = reprDefaults;

export const useOptions = (options: ReprOptions) => {
    usedReprOpts = options;
};
