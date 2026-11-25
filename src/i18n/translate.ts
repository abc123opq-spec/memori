import { Children, ReactNode } from "react";
import { Language_current, Language_setForTest, ILanguage } from "./language";
import { ja } from "./ja";

let dictionary: Record<string, string> = ja;
const missing = new Set<string>();

function has(dict: Record<string, string>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(dict, key);
}

const japanese = /[\u3040-\u30ff\u3400-\u9fff\uff00-\uffef]/;

function track(trimmed: string): void {
  const withoutUnits = trimmed.replace(/(\d)\s*(kg|lb|cm|in|min|ms|h|s)\b/g, "$1");
  if (/[A-Za-z]{2}/.test(withoutUnits) && !japanese.test(trimmed)) {
    missing.add(trimmed);
  }
}

export function Translate_text(s: string, context?: string): string {
  if (Language_current() !== "ja") {
    return s;
  }
  const trimmed = s.trim();
  if (trimmed === "") {
    return s;
  }
  const key = context != null && has(dictionary, `${trimmed}@@${context}`) ? `${trimmed}@@${context}` : trimmed;
  if (has(dictionary, key)) {
    const start = s.indexOf(trimmed);
    return s.slice(0, start) + dictionary[key] + s.slice(start + trimmed.length);
  }
  track(trimmed);
  return s;
}

export function Translate_format(template: string, values: Record<string, string | number>, context?: string): string {
  return Translate_text(template, context).replace(/\{(\w+)\}/g, (match, key: string) =>
    has(values as Record<string, string>, key) ? String(values[key]) : match
  );
}

export function Translate_children(children: ReactNode, context?: string): ReactNode {
  if (Language_current() !== "ja") {
    return children;
  }
  if (typeof children === "string") {
    return Translate_text(children, context);
  }
  if (Array.isArray(children)) {
    return Children.toArray(children).map((child) =>
      typeof child === "string" ? Translate_text(child, context) : child
    );
  }
  return children;
}

export function Translate_missing(): string[] {
  return Array.from(missing);
}

export function Translate_setDictionaryForTest(dict: Record<string, string>, language: ILanguage): void {
  dictionary = dict;
  Language_setForTest(language);
  missing.clear();
}

if (typeof window !== "undefined") {
  Object.defineProperty(window, "__i18nMissing", { get: Translate_missing, configurable: true });
}
