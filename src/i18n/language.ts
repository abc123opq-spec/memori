export type ILanguage = "ja" | "en";

let current: ILanguage | undefined;

export function Language_resolve(search: string | undefined, navigatorLanguage: string | undefined): ILanguage {
  const fromUrl = new URLSearchParams(search ?? "").get("lang");
  if (fromUrl === "ja" || fromUrl === "en") {
    return fromUrl;
  }
  return (navigatorLanguage ?? "").toLowerCase().startsWith("ja") ? "ja" : "en";
}

export function Language_current(): ILanguage {
  if (current == null) {
    const g = globalThis as { location?: { search?: string }; navigator?: { language?: string } };
    current = Language_resolve(g.location?.search, g.location != null ? g.navigator?.language : undefined);
  }
  return current;
}

export function Language_applyToDocument(): void {
  if (typeof document !== "undefined") {
    document.documentElement.lang = Language_current();
  }
}

export function Language_setForTest(language: ILanguage | undefined): void {
  current = language;
}
