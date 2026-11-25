import "mocha";
import { expect } from "chai";
import { WorkoutElapsedText_format } from "../src/utils/workoutElapsedText";

describe("WorkoutElapsedText_format", () => {
  it("shows minutes and seconds under an hour and adds hours after", () => {
    expect(WorkoutElapsedText_format(0)).to.equal("00:00");
    expect(WorkoutElapsedText_format((8 * 60 + 42) * 1000)).to.equal("08:42");
    expect(WorkoutElapsedText_format((3600 + 5 * 60 + 9) * 1000)).to.equal("1:05:09");
  });
});
