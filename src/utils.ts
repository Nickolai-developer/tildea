import { String_, nullableDefaults } from "./constants.js";
import {
    CompleteDefinition,
    ExactTypeEntity,
    TypeDescription,
} from "./interfaces.js";

export const entitiesToDefs = (
    types: (CompleteDefinition | TypeDescription)[],
): CompleteDefinition[] =>
    types.map<CompleteDefinition>(type =>
        type === String
            ? { type: String_, nullableOptions: nullableDefaults }
            : (type as ExactTypeEntity)._tildaEntityType
            ? {
                  type: type as ExactTypeEntity,
                  nullableOptions: nullableDefaults,
              }
            : (type as CompleteDefinition),
    );
