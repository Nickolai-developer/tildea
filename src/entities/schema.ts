import { usedReprOpts } from "../config.js";
import type {
    PropertyValidationStreamableMessage,
    TypeEntity,
    TypeRepresentation,
} from "../index.js";
import { ReprDefinitions, repr } from "../utils.js";
import {
    ExactTypeEntity,
    type EntityInput,
    type ExecutionContext,
    type DependencyMap,
} from "./entity.js";

interface SchemaInput extends EntityInput {
    name: string;
    props: SchemaProperty[];
}

interface SchemaProperty {
    name: string;
    type: TypeEntity;
}

export class Schema extends ExactTypeEntity {
    override readonly entity = "SCHEMA";
    name: string;

    private _props: SchemaProperty[];
    public get props(): SchemaProperty[] {
        return this._props.map(prop => ({ ...prop }));
    }

    constructor({ props, name, ...entityInput }: SchemaInput) {
        super(entityInput);
        this._props = props;
        this.name = name;
    }

    protected override copy(): this {
        return new Schema({
            name: this.name,
            props: this.props,
            declDeps: this.declDeps,
            usedDeps: this.usedDeps,
            nullable: this.nullable,
        }) as this;
    }

    public override repr(depMap?: DependencyMap): TypeRepresentation {
        const nullableStr = super.repr();
        const contextualDependencies = this.applyContextDependencies(
            depMap || {},
        );
        const templateArgsStr = this._declDeps
            .map(d => this.getReprOfDeclaredType(d, contextualDependencies))
            .join(ReprDefinitions.DELIM_COMMA);
        return this.joinTypeParts(
            `${this.name}` + templateArgsStr ? `<${templateArgsStr}>` : "",
            nullableStr,
        );
    }

    public override *execute({
        obj,
        key,
        currentDepth,
        depMap,
    }: ExecutionContext) {
        const propR = repr(obj, key, usedReprOpts);
        const commonError: PropertyValidationStreamableMessage = {
            name: key,
            depth: currentDepth,
            expected: this.repr(depMap),
            found: propR,
        };

        if (propR !== ReprDefinitions.OBJECT) {
            yield commonError;
            return;
        }

        const nullCheck = this.checkNulls({ obj, key, currentDepth, depMap });
        if (nullCheck !== undefined) {
            if (nullCheck !== null) {
                yield nullCheck;
            }
            return;
        }

        const contextDependencies = this.applyContextDependencies(depMap);
        const propErrors: Generator<
            PropertyValidationStreamableMessage,
            void,
            void
        >[] = [];
        const obj_ = obj[key as keyof object];
        for (const { name, type } of this._props) {
            const typeEntity = this.pickDependency(type, contextDependencies);
            propErrors.push(
                typeEntity.execute({
                    obj: obj_,
                    key: name,
                    currentDepth: currentDepth + 1,
                    depMap: contextDependencies,
                }),
            );
        }

        propErrors.push(
            this.redundantPropsErrors(
                obj_,
                this._props.map(type => type.name),
                currentDepth + 1,
            ),
        );

        // ejects common error followed by errors only if there's errors in pools
        let commonErrorWasEjected = false;
        for (const errors of propErrors) {
            if (commonErrorWasEjected) {
                yield* errors;
            } else {
                for (const error of errors) {
                    commonErrorWasEjected = true;
                    yield commonError;
                    yield error;
                    yield* errors;
                }
            }
        }
    }

    public pushProps(...props: SchemaProperty[]): number {
        this._props.push(...props);
        return this._props.length;
    }

    public mergeProps(other: Schema): void {
        const asObj = Object.fromEntries(
            this._props.map(({ type, name }) => [name, type]),
        );
        const parentDefs = Object.fromEntries(
            other._props.map(({ type, name }) => [name, type]),
        );

        this._props = Object.entries(Object.assign(parentDefs, asObj)).map(
            ([name, type]) => ({ name, type }),
        );
    }
}
