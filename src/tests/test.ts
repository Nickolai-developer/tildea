import {
    Declare,
    Field,
    SchemaClass,
} from "../initialization/schema-builder.js";
import { Inspectable } from "../initialization/inspectable.js";
import { Clock, type UnitTest } from "./common.js";
import { Int, Null, Undefined } from "../constants.js";
import type { SchemaValidationResult } from "../index.js";

@Declare("T", "U")
@SchemaClass()
class Model1<T, U> extends Inspectable {
    @Field(
        ["EITHER", "T", ["U"].declare("U").use("U")]
            .declare("T", "U")
            .use("T", "U"),
    )
    prop1: T | U[];

    @Field(["EITHER", "T", ["U"].declare("U").use("U")].declare("T").use("T"))
    prop2: T | U[];

    @Field(["EITHER", "A", ["B"].declare("B").use("U")].declare("A").use("T"))
    prop3: T | U[];

    @Field(
        ["EITHER", "A", "B"]
            .declare("A", "B")
            .use("T", ["C"].declare("C").use("U")),
    )
    prop4: T | U[];

    @Field(["EITHER", "A", "B"].declare("A", "B").use("T", ["U"]))
    prop5: T | U[];

    @Field(["EITHER", "A", ["U"]].declare("A").use("T"))
    prop6: T | U[];
}

@Declare("T", "U")
@SchemaClass()
class Model2<T, U> extends Inspectable {
    @Field([
        "STATIC",
        ["EITHER", "T", Null],
        [["EITHER", "U", Undefined]].opts({ nullable: true }),
    ])
    prop1: [T | null, [U | undefined] | null];
}

@Declare("A", "B")
@SchemaClass()
class Model3<A, B> extends Inspectable {
    @Field(Model2.opts({ nullable: true }).use("A", "B"))
    prop1: Model2<A, B> | null;

    @Field([Int])
    prop2: number[];
}

const unitTest: UnitTest = {
    name: "test",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);
        const Model1_Int_String = Model1.apply(Int, String);
        clock.assertEqual(
            Model1_Int_String.inspect({
                prop1: 0,
                prop2: 0,
                prop3: [""],
                prop4: [],
                prop5: [],
                prop6: 0,
            }),
            null,
        );
        clock.assertEqual(
            Model1_Int_String.inspect({
                prop1: "",
                prop2: "",
                prop3: "",
                prop4: "",
                prop5: "",
                prop6: "",
            }),
            [
                { name: "prop1", expected: "Int | String[]", found: "string" },
                { name: "prop2", expected: "Int | String[]", found: "string" },
                { name: "prop3", expected: "Int | String[]", found: "string" },
                { name: "prop4", expected: "Int | String[]", found: "string" },
                { name: "prop5", expected: "Int | String[]", found: "string" },
                { name: "prop6", expected: "Int | String[]", found: "string" },
            ] as SchemaValidationResult,
        );
        const Model2_Int_Int = Model2.apply(Int, Int);
        clock.assertEqual(Model2_Int_Int.inspect({}), [
            {
                name: "prop1",
                expected: "[Int | null, (Int | undefined)[] | null]",
                found: "undefined",
            },
        ] as SchemaValidationResult);
    },
};

export default unitTest;
