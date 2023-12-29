export const eqDeep = (one: any, other: any): boolean => {
    if (typeof one !== typeof other) {
        return false;
    }
    if (typeof one !== "object" || one === null || other === null) {
        return one === other;
    }
    const keys = [...new Set(Object.keys(one).concat(Object.keys(other)))];
    return keys.every(k => eqDeep(one[k], other[k]));
};
