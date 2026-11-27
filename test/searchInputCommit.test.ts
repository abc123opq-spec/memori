import "mocha";
import { expect } from "chai";
import * as v from "valibot";
import { VExercisePickerState } from "../src/types";
import {
  ISearchInputCommitEvent,
  SearchInputCommit_initial,
  SearchInputCommit_next,
} from "../src/components/exercisePicker/searchInputCommit";

function run(events: ISearchInputCommitEvent[]): Array<string | undefined> {
  let state = SearchInputCommit_initial();
  return events.map((event) => {
    const result = SearchInputCommit_next(state, event);
    state = result.state;
    return result.commit;
  });
}

describe("saved exercise picker state", () => {
  it("loads older saves that still carry a search and drops it", () => {
    const old = {
      screenStack: [],
      sort: "name_asc",
      filters: {},
      selectedExercises: [],
      mode: "workout",
      search: "squat",
    };
    const result = v.safeParse(VExercisePickerState, old);
    expect(result.success).to.equal(true);
    expect(result.output).to.not.have.property("search");
  });
});

describe("SearchInputCommit", () => {
  it("commits every change while not composing", () => {
    expect(
      run([
        { type: "change", text: "s" },
        { type: "change", text: "sq" },
      ])
    ).to.deep.equal(["s", "sq"]);
  });

  it("holds changes during composition and commits the confirmed text at its end", () => {
    expect(
      run([
        { type: "compositionStart" },
        { type: "change", text: "す" },
        { type: "change", text: "すく" },
        { type: "change", text: "スクワット" },
        { type: "compositionEnd", text: "スクワット" },
      ])
    ).to.deep.equal([undefined, undefined, undefined, undefined, "スクワット"]);
  });

  it("commits when the final input arrives after compositionend (WebKit order)", () => {
    expect(
      run([
        { type: "compositionStart" },
        { type: "change", text: "すく" },
        { type: "compositionEnd", text: "すく" },
        { type: "change", text: "すく" },
      ])
    ).to.deep.equal([undefined, undefined, "すく", undefined]);
  });

  it("commits a deletion that empties the field after composing", () => {
    expect(
      run([
        { type: "compositionStart" },
        { type: "compositionEnd", text: "べんち" },
        { type: "change", text: "べん" },
        { type: "change", text: "" },
      ])
    ).to.deep.equal([undefined, "べんち", "べん", ""]);
  });
});
