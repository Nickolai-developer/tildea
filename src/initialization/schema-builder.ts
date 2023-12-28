import { String_, nullableDefaults } from "../constants.js";
import Inspectable from "./inspectable.js";
import {
    NullableOptions,
    Schema,
    ExactTypeEntity,
    TypeDescription,
    StaticArrayElementDescription,
    CompleteDefinition,
} from "../interfaces.js";
import Store from "./store.js";

const POSSIBLE_MODEL_ROOTS: Function[] = [Inspectable, Object];

const getSchema = (target: Function): Schema => {
    let schema = Store.get(target);
    if (!schema) {
        schema = {
            _tildaEntityType: "schema",
            name: target.name,
            definitions: [],
        };
        Store.set(target, schema);
    }
    return schema;
};

const recognizeType = (type?: TypeDescription): ExactTypeEntity | null => {
    if (!type || type === String) {
        return String_;
    }

    if ((type as ExactTypeEntity)._tildaEntityType) {
        return type as ExactTypeEntity;
    }
    if (Array.isArray(type)) {
        if (!type.length) {
            return null;
        }
        if (type[0] === "EITHER") {
            const types = type.slice(1) as ExactTypeEntity[];
            if (!types.every(e => e._tildaEntityType) || type.length < 3) {
                return null;
            }
            return {
                _tildaEntityType: "either",
                types,
            };
        }
        if (type[0] === "STATIC") {
            const types = type.slice(1) as StaticArrayElementDescription[];
            const defs = types.map<CompleteDefinition>(e => {
                let type: ExactTypeEntity, options: Partial<NullableOptions>;
                if (Array.isArray(e)) {
                    [type, options] = e;
                } else {
                    type = e;
                    options = {};
                }
                return {
                    type,
                    nullableOptions: Object.assign(
                        {},
                        nullableDefaults,
                        options,
                    ),
                };
            });
            return {
                _tildaEntityType: "staticArray",
                types: defs,
            };
        }
        let elemType: ExactTypeEntity | undefined,
            options: Partial<NullableOptions> = {};
        if (Array.isArray(type[0]) && type.length === 2) {
            [[elemType], options] = type;
        } else if (type.length === 1) {
            elemType = type[0];
            options = {};
        }
        if (!elemType) {
            return null;
        }
        return {
            _tildaEntityType: "array",
            elemDefinition: {
                type: elemType,
                nullableOptions: Object.assign({}, nullableDefaults, options),
            },
        };
    }

    return null;
};

export const SchemaClass = (name?: string): ClassDecorator => {
    return (target: Function) => {
        const schema = getSchema(target);
        if (name) {
            schema.name = name;
        }
        let defs = Object.fromEntries(
            schema.definitions.map(({ definition, name }) => [
                name,
                definition,
            ]),
        );
        let constructor = target;
        while (true) {
            constructor = constructor.prototype.__proto__.constructor;
            if (POSSIBLE_MODEL_ROOTS.includes(constructor)) {
                break;
            }
            const parentSchema = getSchema(constructor);
            const parentDefs = Object.fromEntries(
                parentSchema.definitions.map(({ definition, name }) => [
                    name,
                    definition,
                ]),
            );
            defs = Object.assign({}, parentDefs, defs);
        }
        schema.definitions = Object.entries(defs).map(([name, definition]) => ({
            name,
            definition,
        }));
    };
};

export const Field = (
    type?: TypeDescription,
    options?: Partial<NullableOptions>,
): PropertyDecorator => {
    const opts = Object.assign({}, nullableDefaults, options || {});
    const typeEntity = recognizeType(type);
    return (target: Object, propertyKey: string | symbol) => {
        if (typeof propertyKey === "symbol") {
            throw new Error("Symbols aren't implemented~");
        }
        if (typeEntity === null) {
            throw new Error(
                `Cannot recognize type for ${target.constructor.name}.${propertyKey}`,
            );
        }
        const schema = getSchema(target.constructor);
        schema.definitions.push({
            name: propertyKey,
            definition: {
                type: typeEntity,
                nullableOptions: opts,
            },
        });
    };
};
