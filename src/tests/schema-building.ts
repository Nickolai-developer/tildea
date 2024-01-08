import { Field, SchemaClass } from "../initialization/schema-builder.js";
import { Schema } from "../entities/schema.js";
import { Int } from "../constants.js";
import { Inspectable } from "../initialization/inspectable.js";
import { Store } from "../initialization/store.js";
import { Clock, UnitTest } from "./common.js";

@SchemaClass()
class Model1 extends Inspectable {
    @Field(Int)
    prop1: number;

    @Field(String.opts({ optional: true }))
    prop2?: string;
}

const unitTest: UnitTest = {
    name: "schema-building",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);
        clock.assertEqual(
            Store.get(Model1),
            new Schema({
                name: "Model1",
                props: [
                    {
                        name: "prop1",
                        type: Int,
                    },
                    {
                        name: "prop2",
                        type: String.opts({ optional: true }),
                    },
                ],
            }),
        );
    },
};

export default unitTest;
