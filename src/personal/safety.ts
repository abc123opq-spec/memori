const BACKUP_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000;
const INSTALL_HINT_KEY = "memori.installHintDismissed";
const LAST_EXPORT_KEY = "memori.lastJsonExport";

export function PersonalSafety_isStandalone(
  navigatorStandalone: boolean | undefined,
  displayModeStandalone: boolean
): boolean {
  return navigatorStandalone === true || displayModeStandalone;
}

export function PersonalSafety_showInstallHint(isStandalone: boolean, isDismissed: boolean): boolean {
  return !isStandalone && !isDismissed;
}

export function PersonalSafety_isIos(userAgent: string, maxTouchPoints: number): boolean {
  return /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
}

export function PersonalSafety_exportMethod(isIos: boolean, canShareFiles: boolean): "share" | "download" {
  return isIos && canShareFiles ? "share" : "download";
}

// personal-fork: a cancelled share sheet saved nothing, so it is not recorded; other share errors fall back to a download
export function PersonalSafety_exportOutcome(result: "shared" | string): {
  shouldDownload: boolean;
  shouldRecord: boolean;
} {
  if (result === "shared") {
    return { shouldDownload: false, shouldRecord: true };
  }
  if (result === "AbortError") {
    return { shouldDownload: false, shouldRecord: false };
  }
  return { shouldDownload: true, shouldRecord: true };
}

export function PersonalSafety_backupReminder(
  lastExport: number | undefined,
  now: number
): { lastExport?: number; isDue: boolean } {
  const valid = lastExport != null && Number.isFinite(lastExport) ? lastExport : undefined;
  return { lastExport: valid, isDue: valid == null || now - valid >= BACKUP_INTERVAL_MS };
}

function read(key: string): string | undefined {
  try {
    return typeof localStorage !== "undefined" ? (localStorage.getItem(key) ?? undefined) : undefined;
  } catch {
    return undefined;
  }
}

function write(key: string, value: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
  } catch {
    return;
  }
}

export function PersonalSafety_currentStandalone(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  const nav = window.navigator as Navigator & { standalone?: boolean };
  const media = typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches;
  return PersonalSafety_isStandalone(nav.standalone, media);
}

export function PersonalSafety_isInstallHintDismissed(): boolean {
  return read(INSTALL_HINT_KEY) === "1";
}

export function PersonalSafety_dismissInstallHint(): void {
  write(INSTALL_HINT_KEY, "1");
}

export function PersonalSafety_lastExport(): number | undefined {
  const raw = read(LAST_EXPORT_KEY);
  return raw != null ? Number(raw) : undefined;
}

export const PersonalSafety_exportedEvent = "memori-exported";

export function PersonalSafety_markExported(now: number): void {
  write(LAST_EXPORT_KEY, String(now));
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new Event(PersonalSafety_exportedEvent));
  }
}
