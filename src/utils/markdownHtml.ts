import MarkdownIt from "markdown-it";

const cjkChar = /[　-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/;

// personal-fork: CommonMark does not close "**85%**ほど", so a CJK neighbour counts like punctuation for flanking.
function MarkdownHtml_cjkFriendly(md: MarkdownIt): MarkdownIt {
  const utils = md.utils;
  const isWhiteSpace = (code: number): boolean => utils.isWhiteSpace(code);
  const isPunct = (code: number): boolean => utils.isMdAsciiPunct(code) || utils.isPunctChar(String.fromCharCode(code));
  const isCjk = (code: number): boolean => cjkChar.test(String.fromCharCode(code));
  md.inline.State = class extends md.inline.State {
    public scanDelims(start: number, canSplitWord: boolean): { can_open: boolean; can_close: boolean; length: number } {
      const marker = this.src.charCodeAt(start);
      const lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 0x20;
      let pos = start;
      while (pos < this.posMax && this.src.charCodeAt(pos) === marker) {
        pos += 1;
      }
      const nextChar = pos < this.posMax ? this.src.charCodeAt(pos) : 0x20;
      const lastPunct = isPunct(lastChar);
      const nextPunct = isPunct(nextChar);
      const lastSpace = isWhiteSpace(lastChar);
      const nextSpace = isWhiteSpace(nextChar);
      const nearCjk = isCjk(lastChar) || isCjk(nextChar);
      const left = !nextSpace && (!nextPunct || lastSpace || lastPunct || nearCjk);
      const right = !lastSpace && (!lastPunct || nextSpace || nextPunct || nearCjk);
      return {
        can_open: left && (canSplitWord || !right || lastPunct),
        can_close: right && (canSplitWord || !left || nextPunct),
        length: pos - start,
      };
    }
  };
  return md;
}

const md = MarkdownHtml_cjkFriendly(new MarkdownIt({ html: true, linkify: true }));
const mdWithoutHtml = MarkdownHtml_cjkFriendly(new MarkdownIt({ html: false, linkify: true }));

export function MarkdownHtml_render(value: string, isHtmlDisabled: boolean): string {
  return (isHtmlDisabled ? mdWithoutHtml : md).render(value);
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// personal-fork: directive names and attributes come from program text, so they are escaped before becoming HTML
export function MarkdownHtml_directives(text: string, kinds: { exercise: boolean; exerciseExample: boolean }): string {
  let result = text;
  if (kinds.exercise) {
    result = result.replace(/\[\{([^}]+)\}\]/g, (_match, name: string) => {
      const safe = escapeHtml(name.trim());
      return `<strong class="md-exercise-directive md" data-name="${safe}">${safe}</strong>`;
    });
  }
  if (kinds.exerciseExample) {
    result = result.replace(/^:::exercise-example\{([^}]*)\}[ \t]*$/gm, (_match, attrsStr: string) => {
      const attrs: Record<string, string> = {};
      for (const m of attrsStr.matchAll(/(\w+)="([^"]*)"/g)) {
        attrs[m[1]] = m[2];
      }
      const a = (key: string): string => escapeHtml(attrs[key] || "");
      return `<div class="md-exercise-example mb-4" data-exercise="${a("exercise")}" data-equipment="${a("equipment")}" data-key="${a("key")}" data-weeks="${a("weeks")}" data-week-labels="${a("weekLabels")}" data-onerm="${a("onerm")}"></div>`;
    });
  }
  return result;
}
