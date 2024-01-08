import { nullableDefaults, usedReprOpts } from "../config.js";
import { TildaRuntimeError, TildaSchemaBuildingError } from "../errors.js";
import {
    DependencyIndex,
    NullableOptions,
    PropertyValidationStreamableMessage,
    TypeRepresentation,
} from "../index.js";
import {
    TypeDescription,
    constructType,
} from "../initialization/schema-builder.js";
import { ReprDefinitions, repr } from "../validation/repr.js";

/**
 * Type in schemas can either be a exact type
 * as well as index pointing on a dependency which is another exact type
 */
export type TypeEntity = ExactTypeEntity | DependencyIndex;

export interface EntityInput {
    nullable?: Partial<NullableOptions>;
    declDeps?: DependencyIndex[];
    usedDeps?: TypeEntity[];
}

export interface DependencyMap {
    [x: string]: TypeEntity;
}

export interface ExecutionContext {
    obj: object;
    key: string;
    currentDepth: number;
    readonly depMap: DependencyMap;
}

export abstract class ExactTypeEntity {
    readonly entity: string;

    protected _nullable: NullableOptions;
    get nullable() {
        return Object.assign({}, this._nullable);
    }

    protected _declDeps: DependencyIndex[];
    get declDeps() {
        return Object.assign([], this._declDeps);
    }

    protected _usedDeps: TypeEntity[];
    get usedDeps() {
        return Object.assign([], this._usedDeps);
    }

    constructor({ nullable, declDeps, usedDeps }: EntityInput) {
        this._nullable = Object.assign({}, nullableDefaults, nullable);
        this._declDeps = Object.assign([], declDeps);
        this._usedDeps = Object.assign([], usedDeps);
    }

    protected abstract copy(): this;

    public opts(options: Partial<NullableOptions>): this {
        const cp = this.copy();
        cp._nullable = Object.assign({}, nullableDefaults, options);
        return cp;
    }

    public declare(...args: DependencyIndex[]): this {
        this._declDeps.push(...args);
        return this;
    }

    public use(...args: TypeDescription[]): this {
        if (this._declDeps.length < args.length + this._usedDeps.length) {
            throw new TildaSchemaBuildingError(
                `Tried to use ${args.length} dependencies, but type has only ${this._declDeps.length} declared`,
            );
        }
        const cp = this.copy();
        cp._usedDeps.push(
            ...args.map(description => constructType(description)),
        );
        return cp;
    }

    public execute(
        _o: ExecutionContext,
    ): Generator<PropertyValidationStreamableMessage, void, void> {
        return null as any;
    }

    protected *redundantPropsErrors(
        obj: object,
        objectOwnKeys: string[],
        currentDepth: number,
    ): Generator<PropertyValidationStreamableMessage, void, void> {
        const objKeys = Object.keys(obj);
        const redundantKeys = objKeys.filter(
            key => !objectOwnKeys.includes(key),
        );

        for (const key of redundantKeys) {
            if (
                obj[key as keyof object] === undefined &&
                !usedReprOpts.hasPropertyCheck
            ) {
                continue;
            }
            yield {
                name: key,
                depth: currentDepth,
                expected: usedReprOpts.hasPropertyCheck
                    ? ReprDefinitions.NO_PROPERTY
                    : ReprDefinitions.UNDEFINED,
                found: repr(obj, key, usedReprOpts),
            };
        }
    }

    protected joinTypeParts(
        ...args: (string | false | null | undefined)[]
    ): TypeRepresentation {
        return args.filter(s => s).join(ReprDefinitions.DELIM_OR);
    }

    protected encase(type: TypeRepresentation): TypeRepresentation {
        return type.startsWith("(") && type.endsWith(")") ? type : `(${type})`;
    }

    protected _repr: TypeRepresentation | undefined;
    public get repr(): TypeRepresentation {
        const { defined, nullable, optional } = this._nullable;
        return this.joinTypeParts(
            nullable && ReprDefinitions.NULL,
            !defined && ReprDefinitions.UNDEFINED,
            usedReprOpts.hasPropertyCheck &&
                optional &&
                ReprDefinitions.NO_PROPERTY,
        );
    }

    protected checkNulls({
        obj,
        key,
        currentDepth,
    }: Omit<
        ExecutionContext,
        "depMap"
    >): PropertyValidationStreamableMessage | null | void {
        const propR = repr(obj, key, usedReprOpts);

        if (
            ![
                ReprDefinitions.NULL,
                ReprDefinitions.UNDEFINED,
                ReprDefinitions.NO_PROPERTY,
            ].includes(propR as ReprDefinitions)
        ) {
            return;
        }

        const possibleNulls = this.repr
            .slice(1)
            .split(ReprDefinitions.DELIM_OR) as ReprDefinitions[];

        if (!possibleNulls.includes(propR as ReprDefinitions)) {
            return {
                name: key,
                depth: currentDepth,
                expected: this.repr,
                found: propR,
            };
        }

        return null;
    }

    public get fullyDefined(): boolean {
        return this._declDeps.length <= this._usedDeps.length;
    }

    protected applyContextDependencies(
        depMap: /* readonly */ DependencyMap,
    ): DependencyMap {
        if (!this.fullyDefined) {
            throw new TildaRuntimeError(
                `Cannot validate \`${this.constructor.name}\`. It's a template.`,
            );
        }
        const entityContext = Object.fromEntries(
            this._declDeps
                .map(
                    (k, i) => k !== this._usedDeps[i] && [k, this._usedDeps[i]],
                )
                .filter(e => e) as readonly any[],
        );
        return Object.assign({}, depMap, entityContext);
    }

    protected pickDependency(
        type: TypeEntity,
        depMap: DependencyMap,
    ): ExactTypeEntity {
        if (type instanceof ExactTypeEntity) {
            return type;
        }
        const next = depMap[type];
        if (!next) {
            throw new TildaRuntimeError(
                `No type in current scope for "${type}" in \`${this.constructor.name}\`. You either forgot to call .declare on type entity or pass this type on a top level.`,
            );
        }
        return this.pickDependency(next, depMap);
    }
}
