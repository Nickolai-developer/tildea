import { String_, nullableDefaults } from "../constants.js";
import Inspectable from "./inspectable.js";
import Store from "./store.js";
import Schema from "../entities/schema.js";
import {
    ArrayLikeDescription,
    DependencyIndex,
    NullableOptions,
    TypeDescription,
    TypeEntity,
} from "../interfaces.js";
import ExactTypeEntity from "../entities/entity.js";
import ScalarType from "../entities/scalar.js";
import { TildaSchemaBuildingError } from "../errors.js";
import ArrayType from "../entities/array.js";
import EitherType from "../entities/either.js";
import StaticArrayType from "../entities/static-array.js";

const POSSIBLE_MODEL_ROOTS: Function[] = [Inspectable, Object];

const getSchema = (target: Function): Schema => {
    let schema = Store.get(target);
    if (!schema) {
        schema = new Schema({
            name: target.name,
            props: [],
            nullable: nullableDefaults,
        });
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
        let constructor = target;
        while (true) {
            constructor = constructor.prototype.__proto__.constructor;
            if (POSSIBLE_MODEL_ROOTS.includes(constructor)) {
                break;
            }
            const parentSchema = getSchema(constructor);
            schema.mergeProps(parentSchema);
        }
    };
};

declare global {
    interface Array<T> {
        use(...args: TypeDescription[]): ExactTypeEntity;
        declare(...args: DependencyIndex[]): ExactTypeEntity;
    }
    interface StringConstructor {
        opts(options: Partial<NullableOptions>): ScalarType;
    }
}

Array.prototype.declare = function (
    this: ArrayLikeDescription,
    ...args: DependencyIndex[]
): ExactTypeEntity {
    const type = constructType(this) as ExactTypeEntity;
    return type.declare(...args);
};

Array.prototype.use = function (
    this: ArrayLikeDescription,
    ...args: TypeDescription[]
): ExactTypeEntity {
    const type = constructType(this) as ExactTypeEntity;
    return type.use(...args);
};

String.opts = String_.opts;

export const constructType = (type: TypeDescription): TypeEntity => {
    if (typeof type === "function") {
        return String_;
    }
    if (type instanceof ExactTypeEntity || typeof type === "string") {
        return type;
    }
    const e = new TildaSchemaBuildingError(
        `Cannot construct type from value: "${type}".`,
    );
    if (!Array.isArray(type)) {
        throw e;
    }
    if (type.length === 1) {
        const elemType = constructType(type[0]);
        return new ArrayType({ elemType });
    }
    if (type[0] === "EITHER" && type.length > 2) {
        const types = type.slice(1).map(t => constructType(t));
        return new EitherType({ types });
    }
    if (type[0] === "STATIC") {
        const types = type.slice(1).map(t => constructType(t));
        return new StaticArrayType({ types });
    }
    throw e;
};

export const Field = (type: TypeDescription): PropertyDecorator => {
    const typeEntity = constructType(type);
    return (target: Object, propertyKey: string | symbol) => {
        if (typeof propertyKey === "symbol") {
            throw new TildaSchemaBuildingError("Symbols aren't implemented~");
        }
        const schema = getSchema(target.constructor);
        schema.pushProps({
            name: propertyKey,
            type: typeEntity,
        });
    };
};
