import "mocha";
import { expect } from "chai";
import { ja } from "../src/i18n/ja";
import { Translate_setDictionaryForTest } from "../src/i18n/translate";
import { DateUtils_formatRange, DateUtils_weekdayInitials } from "../src/utils/date";
import { StringUtils_joinNames } from "../src/utils/string";
import { Rm1Formula_previewText } from "../src/models/rm1Formula";
import { Program_exerciseRangeFormat } from "../src/models/program";
import { DashboardStarter_text } from "../src/models/dashboardStarter";
import {
  DashboardWidgetFields_aggHint,
  DashboardWidgetFields_presetLabel,
  DashboardWidgetFields_seriesSummary,
  DashboardWidgetFields_valueHint,
} from "../src/models/dashboardWidgetFields";
import { EquipmentSetup_summary, EquipmentSetup_validate } from "../src/models/equipmentSetup";
import { LiftographCalendar_footer } from "../src/liftograph/liftographCalendar";
import { LiftographChartData_displayName } from "../src/liftograph/liftographChartData";
import { fxSettings } from "./liftographFixtures";

const JAPANESE = /[぀-ヿ㐀-鿿＀-￯]/;

describe("Japanese display text from models and utils", () => {
  beforeEach(() => {
    Translate_setDictionaryForTest(ja, "ja");
  });

  afterEach(() => {
    Translate_setDictionaryForTest(ja, "en");
  });

  it("formats a week range the Japanese way", () => {
    expect(DateUtils_formatRange(new Date(2026, 10, 22), new Date(2026, 10, 28))).to.equal("2026年11月22日〜28日");
    expect(DateUtils_formatRange(new Date(2026, 10, 29), new Date(2026, 11, 5))).to.equal("2026年11月29日〜12月5日");
    expect(DateUtils_formatRange(new Date(2026, 11, 28), new Date(2027, 0, 3))).to.equal(
      "2026年12月28日〜2027年1月3日"
    );
  });

  it("lists the weekday initials from Sunday or Monday", () => {
    expect(DateUtils_weekdayInitials()).to.eql(["日", "月", "火", "水", "木", "金", "土"]);
    expect(DateUtils_weekdayInitials(true)).to.eql(["月", "火", "水", "木", "金", "土", "日"]);
  });

  it("joins names with the Japanese comma", () => {
    expect(StringUtils_joinNames(["大胸筋（鎖骨部）", "大胸筋（胸骨部）"])).to.equal(
      "大胸筋（鎖骨部）、大胸筋（胸骨部）"
    );
  });

  it("translates the 1RM preview and the program ranges", () => {
    expect(Rm1Formula_previewText("epley")).to.equal("5回：86% · 10回：75% · 15回：67%");
    expect(Program_exerciseRangeFormat(3, 3)).to.equal("1日3種目");
    expect(Program_exerciseRangeFormat(1, 1)).to.equal("1日1種目");
    expect(Program_exerciseRangeFormat(3, 5)).to.equal("1日3〜5種目");
  });

  it("translates the dashboard form hints and series summary", () => {
    expect(DashboardWidgetFields_presetLabel("maxWeight")).to.equal("最大重量");
    expect(DashboardWidgetFields_aggHint("group", undefined)).to.equal("ワークアウトごとに1点を描きます。");
    expect(DashboardWidgetFields_aggHint("group", { type: "agg", agg: "max", window: "1w" })).to.equal(
      "週ごとに1点（その期間の最大値）を描きます。"
    );
    expect(DashboardWidgetFields_valueHint("compare", "4w")).to.equal(
      "4週間前からの変化を表示します（例：「▲ 7.5 4w前比」）。"
    );
    expect(
      DashboardWidgetFields_seriesSummary({
        source: { type: "exercise", name: "Deadlift", equipment: "Barbell" },
        values: { type: "preset", preset: "e1rm" },
        group: { type: "agg", agg: "max", window: "1w" },
        extra: [],
      })
    ).to.equal("デッドリフト（バーベル） · 推定1RM · 週ごとの最大");
  });

  it("translates the calendar footer", () => {
    const result = { window: { from: 0, to: 0 }, weekStart: 0, countByDay: {}, streakWeeks: 0 } as never;
    expect(LiftographCalendar_footer({ ...(result as object), total: 1 } as never, { n: 6, unit: "m" })).to.equal(
      "6か月で1回"
    );
    expect(LiftographCalendar_footer({ ...(result as object), total: 12 } as never, "all")).to.equal("合計12回");
  });

  it("shows an exercise series name in Japanese and keeps a plain name", () => {
    const settings = fxSettings();
    expect(LiftographChartData_displayName("Squat", settings)).to.equal("スクワット");
    expect(LiftographChartData_displayName("Squat, Dumbbell", settings)).to.equal("スクワット（ダンベル）");
    expect(LiftographChartData_displayName("My own line", settings)).to.equal("My own line");
    expect(LiftographChartData_displayName("Workouts in 7 days", settings)).to.equal("7日間のワークアウト数");
  });

  it("translates the equipment errors and summary", () => {
    const setup = { type: "bands", unit: "kg", bands: [], direction: "adds" } as never;
    expect(EquipmentSetup_validate(setup)).to.eql(["バンドを1つ以上追加してください。"]);
    const stack = {
      type: "stack",
      unit: "kg",
      ranges: [{ from: 5, to: 50, step: 5 }],
      stackCount: 2,
      direction: "adds",
    } as never;
    expect(EquipmentSetup_summary(stack)).to.equal("重量スタック · 5–50（5刻み） · 2スタック");
  });

  it("keeps stored text in English", () => {
    const text = DashboardStarter_text([{ id: "squat", equipment: "barbell" }], fxSettings());
    expect(text.match(JAPANESE)?.[0]).to.equal(undefined);
    expect(text).to.include("Workouts in 7 days");
  });
});

describe("English display text from models and utils", () => {
  it("keeps the English wording", () => {
    Translate_setDictionaryForTest(ja, "en");
    expect(DateUtils_weekdayInitials()).to.eql(["S", "M", "T", "W", "T", "F", "S"]);
    expect(Program_exerciseRangeFormat(3, 5)).to.equal("3-5 exercises per day");
    expect(StringUtils_joinNames(["a", "b"])).to.equal("a, b");
  });
});
