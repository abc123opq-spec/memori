import "mocha";
import { expect } from "chai";
import { allExercisesList } from "../src/models/exercise";
import { availableBodyParts, availableMuscles, equipments } from "../src/types";
import { StringUtils_uncamelCase } from "../src/utils/string";
import { jaExerciseNames } from "../src/i18n/ja/exerciseNames";
import { jaEquipmentNames } from "../src/i18n/ja/equipmentNames";
import { jaMuscles } from "../src/i18n/ja/muscles";

describe("Japanese exercise, equipment and muscle names", () => {
  it("covers every built-in exercise, with no duplicates and no stray keys", () => {
    const ids = Object.keys(allExercisesList);
    expect(ids.filter((id) => !jaExerciseNames[id])).to.deep.equal([]);
    expect(Object.keys(jaExerciseNames).filter((id) => !allExercisesList[id])).to.deep.equal([]);
    const names = Object.values(jaExerciseNames) as string[];
    const duplicated = names.filter((n, i) => names.indexOf(n) !== i);
    expect(duplicated).to.deep.equal([]);
  });

  it("covers every built-in equipment and muscle name", () => {
    expect(equipments.filter((e) => !jaEquipmentNames[e])).to.deep.equal([]);
    const muscleKeys = [...availableMuscles, ...availableBodyParts].map((m) => StringUtils_uncamelCase(m));
    expect(muscleKeys.filter((k) => !jaMuscles[k])).to.deep.equal([]);
  });
});
