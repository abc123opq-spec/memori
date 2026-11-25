import "mocha";
import { expect } from "chai";
import {
  PersonalSafety_exportMethod,
  PersonalSafety_exportOutcome,
  PersonalSafety_isIos,
  PersonalSafety_backupReminder,
  PersonalSafety_isStandalone,
  PersonalSafety_showInstallHint,
} from "../src/personal/safety";

const DAY = 24 * 60 * 60 * 1000;

describe("PersonalSafety", () => {
  const now = new Date(2026, 10, 25, 12).getTime();

  it("treats the app as installed when either standalone signal is on", () => {
    expect(PersonalSafety_isStandalone(true, false)).to.equal(true);
    expect(PersonalSafety_isStandalone(undefined, true)).to.equal(true);
    expect(PersonalSafety_isStandalone(undefined, false)).to.equal(false);
  });

  it("shows the install hint only in a browser tab that has not dismissed it", () => {
    expect(PersonalSafety_showInstallHint(false, false)).to.equal(true);
    expect(PersonalSafety_showInstallHint(false, true)).to.equal(false);
    expect(PersonalSafety_showInstallHint(true, false)).to.equal(false);
  });

  it("asks for a backup when there has never been one", () => {
    expect(PersonalSafety_backupReminder(undefined, now)).to.deep.equal({ lastExport: undefined, isDue: true });
  });

  it("asks for a backup from 14 days after the last one", () => {
    expect(PersonalSafety_backupReminder(now - 13 * DAY, now).isDue).to.equal(false);
    expect(PersonalSafety_backupReminder(now - 14 * DAY, now)).to.deep.equal({
      lastExport: now - 14 * DAY,
      isDue: true,
    });
  });

  it("ignores a stored date that is not a number", () => {
    expect(PersonalSafety_backupReminder(Number("x"), now)).to.deep.equal({ lastExport: undefined, isDue: true });
  });

  it("shares the backup file on iOS when files can be shared, and downloads otherwise", () => {
    expect(PersonalSafety_exportMethod(true, true)).to.equal("share");
    expect(PersonalSafety_exportMethod(true, false)).to.equal("download");
    expect(PersonalSafety_exportMethod(false, true)).to.equal("download");
  });

  it("records the export only when the file was shared or a download was started", () => {
    expect(PersonalSafety_exportOutcome("shared")).to.eql({ shouldDownload: false, shouldRecord: true });
    expect(PersonalSafety_exportOutcome("AbortError")).to.eql({ shouldDownload: false, shouldRecord: false });
    expect(PersonalSafety_exportOutcome("NotAllowedError")).to.eql({ shouldDownload: true, shouldRecord: true });
  });

  it("tells iPhone and iPad from other browsers", () => {
    expect(PersonalSafety_isIos("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", 5)).to.equal(true);
    expect(PersonalSafety_isIos("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5)).to.equal(true);
    expect(PersonalSafety_isIos("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 0)).to.equal(false);
    expect(PersonalSafety_isIos("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 0)).to.equal(false);
  });
});
