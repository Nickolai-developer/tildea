import {
    Declare,
    Field,
    SchemaClass,
} from "../initialization/schema-builder.js";
import { Schema } from "../entities/schema.js";
import { Float, Int, String_ } from "../constants.js";
import { Inspectable } from "../initialization/inspectable.js";
import { Clock, UnitTest } from "./common.js";
import { EitherType } from "../entities/either.js";
import { ArrayType } from "../entities/array.js";
import { StaticArrayType } from "../entities/static-array.js";
import { Store } from "../index.js";

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

@SchemaClass()
class Model2 extends Model1 {
    @Field([
        "EITHER",
        Float,
        [
            "STATIC",
            Float,
            Float,
            Float.opts({ nullable: true, defined: false }),
        ],
    ])
    prop4: number | [number, number, number | null | undefined];

    @Field(
        [["EITHER", String, Int].opts({ nullable: true })].opts({
            nullable: true,
        }),
    )
    prop5: (string | number | null)[] | null;
}

@Declare("T", "U")
@SchemaClass()
class Model3<T, U> {
    @Field(
        ["EITHER", "T", ["U"].declare("U").use("U")]
            .declare("T", "U")
            .use("T", "U"),
    )
    prop6: T | U[];

    @Field(["EITHER", "T", ["U"].declare("U").use("U")].declare("T").use("T"))
    prop7: T | U[];

    @Field(["EITHER", "A", ["B"].declare("B").use("U")].declare("A").use("T"))
    prop8: T | U[];

    @Field(
        ["EITHER", "A", "B"]
            .declare("A", "B")
            .use("T", ["C"].declare("C").use("U")),
    )
    prop9: T | U[];

    @Field(["EITHER", "A", "B"].declare("A", "B").use("T", ["U"]))
    prop10: T | U[];
}

const unitTest: UnitTest = {
    name: "schema-building",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);
        clock.assertEqual(
            Store.get(Model2),
            new Schema({
                name: "Model2",
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
                    {
                        name: "prop4",
                        type: new EitherType({
                            types: [
                                Float,
                                new StaticArrayType({
                                    types: [
                                        Float,
                                        Float,
                                        Float.opts({
                                            defined: false,
                                            nullable: true,
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    },
                    {
                        name: "prop5",
                        type: new ArrayType({
                            elemType: new EitherType({
                                types: [String_, Int],
                                nullable: { nullable: true },
                            }),
                            nullable: { nullable: true },
                        }),
                    },
                ],
            }),
        );
        const model3 = Store.get(Model3)!;
        const schema3 = new Schema({
            name: "Model3",
            props: [
                {
                    name: "prop6",
                    type: new EitherType({
                        types: [
                            "T",
                            new ArrayType({ elemType: "U" })
                                .declare("U")
                                .use("U"),
                        ],
                    })
                        .declare("T", "U")
                        .use("T", "U"),
                },
                {
                    name: "prop7",
                    type: new EitherType({
                        types: [
                            "T",
                            new ArrayType({ elemType: "U" })
                                .declare("U")
                                .use("U"),
                        ],
                    })
                        .declare("T")
                        .use("T"),
                },
                {
                    name: "prop8",
                    type: new EitherType({
                        types: [
                            "A",
                            new ArrayType({ elemType: "B" })
                                .declare("B")
                                .use("U"),
                        ],
                    })
                        .declare("A")
                        .use("T"),
                },
                {
                    name: "prop9",
                    type: new EitherType({
                        types: ["A", "B"],
                    })
                        .declare("A", "B")
                        .use(
                            "T",
                            new ArrayType({ elemType: "C" })
                                .declare("C")
                                .use("U"),
                        ),
                },
                {
                    name: "prop10",
                    type: new EitherType({
                        types: ["A", "B"],
                    })
                        .declare("A", "B")
                        .use("T", new ArrayType({ elemType: "U" })),
                },
            ],
        });
        clock.assertEqual(model3.props[0], schema3.props[0]);
        clock.assertEqual(model3.props[1], schema3.props[1]);
        clock.assertEqual(model3.props[2], schema3.props[2]);
        clock.assertEqual(model3.props[3], schema3.props[3]);
        clock.assertEqual(model3.props[4], schema3.props[4]);
    },
};

export default unitTest;
