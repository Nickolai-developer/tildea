import { reprDefaults } from "./constants.js";
import { ReprOptions } from "./interfaces.js";

export let usedReprOptions: ReprOptions = reprDefaults;

export const tildaConfigure = (options: ReprOptions) => {
    usedReprOptions = options;
};
