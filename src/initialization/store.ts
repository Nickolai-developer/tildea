import { TildaSchema } from "../interfaces.js";

type StoredMetadataKey = Function;

// type SchemaClassName = string;

// type StoredSchemaKey = `schema:${SchemaClassName}`;

type StoredMetadataValue = TildaSchema;

// class StoreClass extends Map<StoredMetadataKey, StoredMetadataValue> {
//     override get(key: StoredSchemaKey): TildaSchema;
//     override get(key: StoredMetadataKey): StoredMetadataValue {
//         return super.get(key);
//     }
// }

const Store = new Map<StoredMetadataKey, StoredMetadataValue>();

export default Store;
