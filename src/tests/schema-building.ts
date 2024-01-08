import { Field, SchemaClass } from "../initialization/schema-builder.js";
import { Schema } from "../entities/schema.js";
import { Float, Int, String_ } from "../constants.js";
import { Inspectable } from "../initialization/inspectable.js";
import { Store } from "../initialization/store.js";
import { Clock, UnitTest } from "./common.js";
import { EitherType } from "../entities/either.js";

@SchemaClass()
class Model1 extends Inspectable {
    @Field(Int)
    prop1: number;

    @Field(String.opts({ optional: true }))
    prop2?: string;

    @Field(
        ["EITHER", Float.opts({ defined: false }), String].opts({
            nullable: true,
        }),
    )
    prop3?: number | string | null;
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
                    {
                        name: "prop3",
                        type: new EitherType({ types: [Float, String_] }).opts({
                            nullable: true,
                        }),
                    },
                ],
            }),
        );
    },
};

export default unitTest;
