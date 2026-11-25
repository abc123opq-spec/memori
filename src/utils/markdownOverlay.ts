import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";

export type IMarkdownKind = "exercise" | "program";

const translatableKeys: Record<IMarkdownKind, string[]> = {
  exercise: ["description"],
  program: ["name", "shortDescription"],
};

const markerNames: Record<IMarkdownKind, string[]> = {
  exercise: ["howto"],
  program: ["more", "faq"],
};

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function codeBlocks(body: string): string[] {
  return body.match(/^```[^\n]*\n[\s\S]*?^```[ \t]*$/gm) || [];
}

function withoutCodeBlocks(body: string): string {
  return body.replace(/^```[^\n]*\n[\s\S]*?^```[ \t]*$/gm, "");
}

function markers(body: string, kind: IMarkdownKind): string[] {
  const names = markerNames[kind].join("|");
  return Array.from(withoutCodeBlocks(body).matchAll(new RegExp(`<!--\\s*(${names})\\s*-->`, "g"))).map((m) => m[1]);
}

function howtoHeadingCount(body: string): number {
  const rest = withoutCodeBlocks(body);
  const idx = rest.search(/<!--\s*howto\s*-->/);
  return idx === -1 ? 0 : (rest.slice(idx).match(/^###\s/gm) || []).length;
}

function parse(text: string): { data: Record<string, unknown>; content: string } | string {
  try {
    const { data, content } = matter(normalize(text));
    return { data, content };
  } catch (e) {
    return `frontmatter cannot be parsed: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export function MarkdownOverlay_check(kind: IMarkdownKind, en: string, ja: string): string[] {
  const enParsed = parse(en);
  const jaParsed = parse(ja);
  if (typeof enParsed === "string" || typeof jaParsed === "string") {
    return [typeof jaParsed === "string" ? `ja: ${jaParsed}` : `en: ${enParsed}`];
  }
  const errors: string[] = [];
  const translatable = translatableKeys[kind];
  const keys = new Set([...Object.keys(enParsed.data), ...Object.keys(jaParsed.data)]);
  for (const key of Array.from(keys)) {
    const enValue = enParsed.data[key];
    const jaValue = jaParsed.data[key];
    if (translatable.includes(key)) {
      if (enValue != null && enValue !== "" && (jaValue == null || jaValue === "")) {
        errors.push(`frontmatter "${key}" is empty in ja`);
      }
    } else if (JSON.stringify(enValue) !== JSON.stringify(jaValue)) {
      errors.push(`frontmatter "${key}" differs: en=${JSON.stringify(enValue)} ja=${JSON.stringify(jaValue)}`);
    }
  }

  const enBlocks = codeBlocks(enParsed.content);
  const jaBlocks = codeBlocks(jaParsed.content);
  if (enBlocks.length !== jaBlocks.length) {
    errors.push(`code block count differs: en=${enBlocks.length} ja=${jaBlocks.length}`);
  } else {
    enBlocks.forEach((block, i) => {
      if (block !== jaBlocks[i]) {
        errors.push(`code block #${i + 1} differs from en`);
      }
    });
  }

  const enMarkers = markers(enParsed.content, kind).join(",");
  const jaMarkers = markers(jaParsed.content, kind).join(",");
  if (enMarkers !== jaMarkers) {
    errors.push(`markers differ: en=[${enMarkers}] ja=[${jaMarkers}]`);
  }
  if (kind === "exercise") {
    const enSteps = howtoHeadingCount(enParsed.content);
    const jaSteps = howtoHeadingCount(jaParsed.content);
    if (enSteps !== jaSteps) {
      errors.push(`number of ### headings after howto differs: en=${enSteps} ja=${jaSteps}`);
    }
  }
  return errors;
}

export function MarkdownOverlay_dir(jaDir: string, lang: string | undefined): string {
  return lang === "en" ? `${jaDir}.disabled` : jaDir;
}

export function MarkdownOverlay_pick(enPath: string, jaDir: string): string {
  const jaPath = path.join(jaDir, path.basename(enPath));
  return fs.existsSync(jaPath) ? jaPath : enPath;
}

export function MarkdownOverlay_orphans(enDir: string, jaDir: string): string[] {
  if (!fs.existsSync(jaDir)) {
    return [];
  }
  return fs.readdirSync(jaDir).filter((f) => f.endsWith(".md") && !fs.existsSync(path.join(enDir, f)));
}

export function MarkdownOverlay_read(
  enPath: string,
  jaDir: string,
  kind: IMarkdownKind
): { raw: string; errors: string[] } {
  const picked = MarkdownOverlay_pick(enPath, jaDir);
  const raw = normalize(fs.readFileSync(picked, "utf8"));
  if (picked === enPath) {
    return { raw, errors: [] };
  }
  const errors = MarkdownOverlay_check(kind, normalize(fs.readFileSync(enPath, "utf8")), raw);
  return { raw, errors: errors.map((e) => `${picked}: ${e}`) };
}
