import { String_, nullableDefaults } from "../constants.js";
import Inspectable from "./inspectable.js";
import {
    NullableOptions,
    TildaSchema,
    TildaTypeEntity,
    Type,
} from "../interfaces.js";
import Store from "./store.js";

const POSSIBLE_MODEL_ROOTS: Function[] = [Inspectable, Object];

const getSchema = (target: Function): TildaSchema => {
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
    type?: Type,
    options?: Partial<NullableOptions>,
): PropertyDecorator => {
    let typeEntity: TildaTypeEntity;
    if (type && type !== String) {
        typeEntity = type as any;
    } else {
        typeEntity = String_;
    }
    const opts = Object.assign({}, nullableDefaults, options || {});
    return (target: Object, propertyKey: string | symbol) => {
        if (typeof propertyKey === "symbol") {
            throw new Error("Symbols aren't implemented~");
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

// @SchemaClass()
// class A extends Inspectable {
//     @Field(String)
//     prop1: string;
// }

// @SchemaClass()
// class B extends A {
//     @Field(Int)
//     prop2: number;
// }

// type Either1 = string | number;
// const Either1_type = new TildaEitherType([String, Int], "Either1");

// @SchemaClass()
// class C extends B {
//     @Field(Either1_type, { nullable: true })
//     prop3: Either1;
// }

// console.log("f");
