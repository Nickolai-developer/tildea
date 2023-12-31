import { nullableDefaults } from "../constants.js";
import {
    EitherTypeDefinition,
    PropertyValidationStreamableMessage,
    ReprOptions,
} from "../interfaces.js";
import { repr, typeRepr } from "../validation/repr.js";
import ExactTypeEntity from "./entity.js";

interface EitherInput {
    name?: string;
    types: ExactTypeEntity[];
}

type Score = number[];

const calcScores = (
    errs: PropertyValidationStreamableMessage[],
    baseDepth: number,
): Score => {
    const scores: Score = [];
    for (let i = 0, currentDepth = baseDepth; i < errs.length; i++) {
        const newDepth = errs[i].depth;
        const scoreLevel = newDepth - baseDepth;
        if (!scores[scoreLevel]) {
            scores[scoreLevel] = 0;
        }
        if (newDepth > currentDepth) {
            scores[scoreLevel - 1]--;
        }
        scores[scoreLevel]++;
        currentDepth = newDepth;
    }
    return scores;
};

const lt = (score: Score, other: Score): boolean => {
    const minindex = Math.min(score.length, other.length);
    for (let i = 0; i < minindex; i++) {
        if (score[i] !== other[i]) {
            return score[i] < other[i];
        }
    }
    return score.length < other.length;
};

const pickBestGuess = (scores: Score[]): number => {
    let min = 0;
    for (let i = 1; i < scores.length; i++) {
        if (lt(scores[i], scores[min])) {
            min = i;
        }
    }
    return min;
};

export default class EitherType extends ExactTypeEntity {
    override readonly entity = "EITHER";
    name?: string;
    types: ExactTypeEntity[];

    constructor({ types, name }: EitherInput) {
        super();
        this.name = name;
        this.types = types;
    }

    public override *execute(
        obj: object,
        key: string,
        def: EitherTypeDefinition,
        options: ReprOptions,
        currentDepth: number,
    ) {
        const nullCheck: PropertyValidationStreamableMessage | string | void =
            this.checkNulls(obj, key, def, options, currentDepth).next().value;
        if (typeof nullCheck === "string") {
            return;
        }
        if (typeof nullCheck === "object") {
            yield nullCheck;
            return;
        }

        const errPools = def.type.types.map(t =>
            t.execute(
                obj,
                key,
                { type: t, nullableOptions: nullableDefaults },
                options,
                currentDepth,
            ),
        );
        const errors: PropertyValidationStreamableMessage[][] = [];
        for (let i = 0; i < errPools.length; i++) {
            const pool = errPools[i];
            const err = pool.next().value;
            if (!err) {
                return;
            }
            errors.push([err]);
        }
        for (let i = 0; i < errPools.length; i++) {
            const pool = errPools[i];
            errors[i].push(...pool);
        }
        const scores = errors.map(errs => calcScores(errs, currentDepth));
        const bestGuess = pickBestGuess(scores);
        yield {
            name: key,
            depth: currentDepth,
            expected: typeRepr(def, options),
            found: repr(obj, key, options),
        };
        yield* errors[bestGuess].slice(1) as any;
    }
}
