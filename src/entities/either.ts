import { usedReprOpts } from "../config.js";
import {
    PropertyValidationStreamableMessage,
    TypeEntity,
} from "../interfaces.js";
import { ReprDefinitions, repr } from "../validation/repr.js";
import ExactTypeEntity, { EntityInput, ExecutionContext } from "./entity.js";

interface EitherInput extends EntityInput {
    name?: string;
    types: TypeEntity[];
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

const uniqueTypes = (types: TypeEntity[]): TypeEntity[] => {
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
    }, [] as TypeEntity[]);
    return unique;
};

export default class EitherType extends ExactTypeEntity {
    override readonly entity = "EITHER";
    name?: string;
    private _types: TypeEntity[];
    public get types(): TypeEntity[] {
        return [...this._types];
    }

    constructor({ types, name, ...entityInput }: EitherInput) {
        super(entityInput);
        this.name = name;
        this._types = types;
    }

    protected override copy(): this {
        return new EitherType(this) as this;
    }

    public override get repr() {
        if (!this._repr) {
            const nullableStr = super.repr;
            if (this.name) {
                return nullableStr
                    ? this.encase(this.joinTypeParts(this.name, nullableStr))
                    : this.name;
            }
            const typeRs = uniqueTypes(this._types).map(t =>
                typeof t === "string" ? t : t.repr,
            );
            nullableStr && typeRs.push(nullableStr);
            const typeR = typeRs.join(ReprDefinitions.DELIM_OR);
            this._repr = typeRs.length > 1 ? this.encase(typeR) : typeR;
        }
        return this._repr;
    }

    public override *execute({
        obj,
        key,
        currentDepth,
        depMap,
    }: ExecutionContext) {
        const nullCheck = this.checkNulls({ obj, key, currentDepth });
        if (nullCheck !== undefined) {
            if (nullCheck !== null) {
                yield nullCheck;
            }
            return;
        }

        const contextDependencies = this.applyContextDependencies(depMap);
        const errPools = this._types.map(type =>
            this.pickDependency(type, contextDependencies).execute({
                obj,
                key,
                currentDepth,
                depMap: contextDependencies,
            }),
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
            expected: this.repr,
            found: repr(obj, key, usedReprOpts),
        };
        yield* errors[bestGuess].slice(1) as any;
    }
}
