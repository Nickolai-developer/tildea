import type { NullableOptions } from "./index.js";

export const eqDeep = (one: unknown, other: unknown): boolean => {
    if (typeof one !== typeof other) {
        return false;
    }
    if (typeof one !== "object" || one === null || other === null) {
        return one === other;
    }
    const keys = [
        ...new Set(Object.keys(one).concat(Object.keys(other as object))),
    ];
    return keys.every(k =>
        eqDeep(
            (one as object)[k as keyof object],
            (other as object)[k as keyof object],
        ),
    );
};

export const mergeNullable = (
    { defined, nullable, optional }: NullableOptions,
    { defined: d, nullable: n, optional: o }: NullableOptions,
): NullableOptions => ({
    defined: defined && d,
    nullable: nullable || n,
    optional: optional || o,
});
