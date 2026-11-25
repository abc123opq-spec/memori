import "mocha";
import { expect } from "chai";
import * as fs from "fs";
import { Storage_get, Storage_getDefault } from "../src/models/storage";
import { Language_setForTest } from "../src/i18n/language";
import { Program_create } from "../src/models/program";
import { PersonalUnits_programToUnit } from "../src/models/personalUnits";
import { IHistoryRecord, IStorage } from "../src/types";
import { Weight_build } from "../src/models/weight";

describe("Japanese kg backup", () => {
  after(() => Language_setForTest(undefined));

  it("comes back unchanged after export to JSON and import", () => {
    Language_setForTest("ja");
    const base = Storage_getDefault();
    const detail = JSON.parse(fs.readFileSync("programdata/programs/builtin/basicBeginner.json", "utf8"));
    const program = {
      ...Program_create("ベーシックビギナールーティン", "bbr1"),
      planner: PersonalUnits_programToUnit(detail.planner, base.settings),
    };
    const now = new Date(2026, 10, 25, 9).getTime();
    const record = {
      vtype: "history_record",
      id: now,
      date: new Date(now).toISOString(),
      startTime: now,
      endTime: now + 30 * 60000,
      programId: program.id,
      programName: program.name,
      day: 1,
      dayName: "Workout A",
      notes: "調子が良かった",
      entries: [
        {
          vtype: "history_entry",
          id: "e1",
          index: 0,
          exercise: { id: "squat", equipment: "barbell" },
          notes: "膝に注意",
          warmupSets: [],
          sets: [
            {
              vtype: "set",
              id: "s1",
              index: 0,
              reps: 5,
              weight: Weight_build(42.5, "kg"),
              originalWeight: Weight_build(42.5, "kg"),
              completedReps: 5,
              completedWeight: Weight_build(42.5, "kg"),
              isCompleted: true,
            },
          ],
        },
      ],
    } as unknown as IHistoryRecord;
    const storage: IStorage = { ...base, programs: [program], currentProgramId: program.id, history: [record] };

    const exported = JSON.stringify(storage, null, 2);
    const imported = Storage_get(JSON.parse(exported), false);

    expect(imported.success).to.equal(true);
    if (imported.success) {
      expect(imported.data.settings.units).to.equal("kg");
      expect(imported.data.settings.lengthUnits).to.equal("cm");
      expect(imported.data.history[0].notes).to.equal("調子が良かった");
      expect(imported.data.history[0].entries[0].sets[0].completedWeight).to.eql(Weight_build(42.5, "kg"));
      expect(imported.data.programs[0].planner).to.eql(program.planner);
      expect(JSON.parse(JSON.stringify(imported.data))).to.eql(JSON.parse(exported));
    }
  });
});
