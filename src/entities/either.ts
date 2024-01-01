import {
    PropertyValidationStreamableMessage,
    ReprOptions,
} from "../interfaces.js";
import { ReprDefinitions, repr } from "../validation/repr.js";
import ExactTypeEntity, { EntityInput } from "./entity.js";

interface EitherInput extends EntityInput {
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

const uniqueTypes = (types: ExactTypeEntity[]): ExactTypeEntity[] => {
    const extendedTypes = types.map(type =>
        type instanceof EitherType && !type.name
            ? uniqueTypes(type.types)
            : type,
    );
    const unique = extendedTypes.flat().reduce((arr, current) => {
        if (arr.findIndex(t => t === current) === -1) {
            arr.push(current);
        }
        return arr;
    }, [] as ExactTypeEntity[]);
    return unique;
};

export default class EitherType extends ExactTypeEntity {
    override readonly entity = "EITHER";
    name?: string;
    types: ExactTypeEntity[];

    constructor({ types, name, ...entityInput }: EitherInput) {
        super(entityInput);
        this.name = name;
        this.types = types;
    }

    public override repr(options: ReprOptions) {
        const nullableStr = super.repr(options);
        if (this.name) {
            return nullableStr
                ? this.encase(this.joinTypeParts(this.name, nullableStr))
                : this.name;
        }
        const typeRs = uniqueTypes(this.types).map(t => t.repr(options));
        nullableStr && typeRs.push(nullableStr);
        const typeR = typeRs.join(ReprDefinitions.DELIM_OR);
        return typeRs.length > 1 ? this.encase(typeR) : typeR;
    }

    public override *execute(
        obj: object,
        key: string,
        type: EitherType,
        options: ReprOptions,
        currentDepth: number,
    ) {
        const nullCheck: PropertyValidationStreamableMessage | string | void =
            this.checkNulls(obj, key, type, options, currentDepth).next().value;
        if (typeof nullCheck === "string") {
            return;
        }
        if (typeof nullCheck === "object") {
            yield nullCheck;
            return;
        }

        const errPools = type.types.map(type =>
            type.execute(obj, key, type, options, currentDepth),
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
            expected: type.repr(options),
            found: repr(obj, key, options),
        };
        yield* errors[bestGuess].slice(1) as any;
    }
}
