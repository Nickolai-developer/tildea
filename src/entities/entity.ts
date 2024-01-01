import { usedReprOpts } from "../config.js";
import { nullableDefaults } from "../constants.js";
import {
    NullableOptions,
    PropertyValidationStreamableMessage,
    TypeRepresentation,
} from "../interfaces.js";
import { ReprDefinitions, repr } from "../validation/repr.js";

export interface EntityInput {
    nullable?: Partial<NullableOptions>;
}

export interface ExecutionContext {
    obj: object;
    key: string;
    currentDepth: number;
}

export default abstract class ExactTypeEntity {
    readonly entity: string;
    nullable: NullableOptions;

    constructor({ nullable }: EntityInput) {
        this.nullable = Object.assign({}, nullableDefaults, nullable);
    }

    public abstract execute({
        obj,
        key,
        currentDepth,
    }: ExecutionContext): Generator<
        PropertyValidationStreamableMessage,
        void,
        void
    >;

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

    // TODO: redefine it in child classes for safety
    protected copy<T extends ExactTypeEntity>(): T {
        return new (this.constructor as new (input: EntityInput) => T)(this);
    }

    public opts(options: Partial<NullableOptions>) {
        const cp = this.copy();
        cp.nullable = Object.assign({}, nullableDefaults, options);
        return cp;
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
        const { defined, nullable, optional } = this.nullable;
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
    }: ExecutionContext): PropertyValidationStreamableMessage | null | void {
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
}
