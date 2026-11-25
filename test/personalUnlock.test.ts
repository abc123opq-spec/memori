import "mocha";
import { expect } from "chai";
import { Subscriptions_hasSubscription } from "../src/utils/subscriptions";
import { ExerciseImageUtils_exists, ExerciseImageUtils_url } from "../src/models/exerciseImage";
import { ISubscription } from "../src/types";
import { Exercise_allExpanded } from "../src/models/exercise";

describe("personal unlock", () => {
  it("treats an empty subscription as active", () => {
    expect(Subscriptions_hasSubscription({ apple: [], google: [] } as ISubscription)).to.equal(true);
  });

  it("has no bundled exercise images", () => {
    expect(ExerciseImageUtils_exists({ id: "benchPress", equipment: "barbell" }, "small")).to.equal(false);
    expect(ExerciseImageUtils_url({ id: "benchPress", equipment: "barbell" }, "large")).to.equal(undefined);
  });

  it("still lists every built-in exercise with its equipment", () => {
    const keys = Exercise_allExpanded({}).map((e) => `${e.id}_${e.equipment}`);
    expect(keys).to.include("benchPress_barbell");
    expect(keys.length).to.be.greaterThan(300);
  });
});
