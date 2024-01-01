import { usedReprOpts } from "../config.js";
import {
    PropertyValidationStreamableMessage,
    TypeRepresentation,
} from "../interfaces.js";
import { ReprDefinitions, repr } from "../validation/repr.js";
import ExactTypeEntity, {
    EntityInput,
    ExecutionContext,
    TERMINATE_EXECUTION,
} from "./entity.js";

interface SchemaInput extends EntityInput {
    name: string;
    props: SchemaProperty[];
}

interface SchemaProperty {
    name: string;
    type: ExactTypeEntity;
}

export default class Schema extends ExactTypeEntity {
    override readonly entity = "SCHEMA";
    name: string;
    props: SchemaProperty[];

    constructor({ props, name, ...entityInput }: SchemaInput) {
        super(entityInput);
        this.props = props;
        this.name = name;
    }

    public override get repr(): TypeRepresentation {
        if (!this._repr) {
            const nullableStr = super.repr;
            return this.joinTypeParts(this.name, nullableStr);
        }
        return this._repr;
    }

    public override *execute({ obj, key, currentDepth }: ExecutionContext) {
        const propR = repr(obj, key, usedReprOpts);
        const commonError: PropertyValidationStreamableMessage = {
            name: key,
            depth: currentDepth,
            expected: this.repr,
            found: propR,
        };

        if (propR !== ReprDefinitions.OBJECT) {
            yield commonError;
            return;
        }

        const nullCheck: PropertyValidationStreamableMessage | string | void =
            this.checkNulls({ obj, key, currentDepth }).next().value;
        if (nullCheck === TERMINATE_EXECUTION) {
            return;
        }
        if (typeof nullCheck === "object") {
            yield nullCheck;
            return;
        }

        const propErrors: Generator<
            PropertyValidationStreamableMessage,
            void,
            void
        >[] = [];
        const obj_ = obj[key as keyof object];
        for (const { name, type: t } of this.props) {
            propErrors.push(
                t.execute({
                    obj: obj_,
                    key: name,
                    currentDepth: currentDepth + 1,
                }),
            );
        }

        propErrors.push(
            this.redundantPropsErrors(
                obj_,
                this.props.map(type => type.name),
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
}
