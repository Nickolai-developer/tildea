import { nullableDefaults } from "./constants.js";
import {
    Definition,
    EitherTypeDefinition,
    NullableOptions,
    TildaDefinitionEntity,
} from "./interfaces.js";

const mergeNullable = (
    { defined, nullable, optional }: NullableOptions,
    { defined: d0, nullable: n0, optional: o0 }: NullableOptions,
): NullableOptions => ({
    defined: defined && d0,
    nullable: nullable || n0,
    optional: optional || o0,
});

interface EitherArrangement {
    types: TildaDefinitionEntity[];
    nullablePart: NullableOptions;
}

export const arrangeEitherTypes = ({
    type,
    ...outerNullablePart
}: EitherTypeDefinition): EitherArrangement => {
    let fullNullablePart = outerNullablePart;
    const types: (TildaDefinitionEntity | TildaDefinitionEntity[])[] = [];
    for (const { type: t, ...innerNullablePart } of type.types) {
        fullNullablePart = mergeNullable(fullNullablePart, innerNullablePart);
        if (t._tildaEntityType === "either") {
            const { types: subtypeTypes, nullablePart: subtypeNullablePart } =
                arrangeEitherTypes({ type: t, ...nullableDefaults });
            types.push(subtypeTypes);
            fullNullablePart = mergeNullable(
                fullNullablePart,
                subtypeNullablePart,
            );
        } else {
            types.push(t);
        }
    }

    if (type.name) {
        return {
            types: [type],
            nullablePart: fullNullablePart,
        };
    }

    const unique = types.flat().reduce((arr, current) => {
        if (arr.findIndex(t => t === current) === -1) {
            arr.push(current);
        }
        return arr;
    }, [] as TildaDefinitionEntity[]);
    return {
        types: unique,
        nullablePart: fullNullablePart,
    };
};

export const bringDefinitionToStandard = (definition: Definition): void => {
    if (
        definition.type._tildaEntityType === "either" &&
        !definition.type.arranged
    ) {
        const { type, ...outerNullablePart } = definition;
        const { types, nullablePart } = arrangeEitherTypes(
            definition as EitherTypeDefinition,
        );
        const fullNullablePart = mergeNullable(outerNullablePart, nullablePart);
        type.types = types.map(t => ({ type: t, ...nullableDefaults }));
        Object.assign(definition, fullNullablePart);
        type.arranged = true;
    }
};
