import {
    PropertyValidationStreamableMessage,
    ReprOptions,
    TypeRepresentation,
} from "../interfaces.js";
import { ReprDefinitions, repr } from "../validation/repr.js";
import ExactTypeEntity, { EntityInput, TERMINATE_EXECUTION } from "./entity.js";

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

    public override repr(options: ReprOptions): TypeRepresentation {
        const nullableStr = super.repr(options);
        return this.joinTypeParts(this.name, nullableStr);
    }

    public override *execute(
        obj: object,
        key: string,
        type: Schema,
        options: ReprOptions,
        currentDepth: number,
    ) {
        const propR = repr(obj, key, options);
        const commonError: PropertyValidationStreamableMessage = {
            name: key,
            depth: currentDepth,
            expected: type.repr(options),
            found: propR,
        };

        if (propR !== ReprDefinitions.OBJECT) {
            yield commonError;
            return;
        }

        const nullCheck: PropertyValidationStreamableMessage | string | void =
            this.checkNulls(obj, key, type, options, currentDepth).next().value;
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
        for (const { name, type: t } of type.props) {
            propErrors.push(
                t.execute(obj_, name, t, options, currentDepth + 1),
            );
        }

        propErrors.push(
            this.redundantPropsErrors(
                obj_,
                type.props.map(def => def.name),
                options,
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
