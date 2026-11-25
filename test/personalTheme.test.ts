import "mocha";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";

const root = process.cwd();
const generated = JSON.parse(fs.readFileSync(path.join(root, "tailwind.semantic.generated.json"), "utf8"));
const upstream = JSON.parse(fs.readFileSync(path.join(root, "tailwind.semantic.json"), "utf8"));
const colors = JSON.parse(fs.readFileSync(path.join(root, "tailwind.colors.json"), "utf8"));
const css = fs.readFileSync(path.join(root, "theme.generated.css"), "utf8");

describe("personal theme", () => {
  it("overlays the instrument palette onto the generated semantic colors", () => {
    expect(generated.light.background.default).to.equal("#FFFFFF");
    expect(generated.dark.background.default).to.equal("#000000");
    expect(generated.light.text.primary).to.equal("#0B0C0E");
    expect(generated.dark.text.secondary).to.equal("#B1B7BF");
    expect(generated.light.button.primarybackground).to.equal("#0B0C0E");
    expect(generated.light.background.surface).to.equal("#F3F4F6");
    expect(generated.dark.border.line).to.equal("#26292D");
    expect(generated.light.button.accentbackground).to.equal("#1257E0");
    expect(generated.dark.button.accentlabel).to.equal("#000000");
  });

  it("keeps every semantic name the upstream file defines", () => {
    const missing: string[] = [];
    const walk = (node: object, trail: string[]): void => {
      for (const [key, value] of Object.entries(node) as [string, unknown][]) {
        if (value && typeof value === "object" && "light" in value && "dark" in value) {
          for (const theme of ["light", "dark"]) {
            let cur = generated[theme];
            for (const t of [...trail, key]) {
              cur = cur?.[t];
            }
            if (typeof cur !== "string") {
              missing.push(`${theme}.${[...trail, key].join(".")}`);
            }
          }
        } else if (value && typeof value === "object") {
          walk(value, [...trail, key]);
        }
      }
    };
    walk(upstream, []);
    expect(missing).to.deep.equal([]);
  });

  it("still detects dark mode", () => {
    expect(generated.dark.background.default).to.equal(colors.black);
    expect(generated.light.background.default).to.not.equal(colors.black);
  });

  it("writes the system font and 8px radius into the theme css", () => {
    expect(css).to.contain("--font-sans: -apple-system");
    expect(css).to.not.contain("--font-sans: Poppins");
    expect(css).to.contain("--radius-xl: 8px;");
    expect(css).to.contain("--color-background-surface: #F3F4F6;");
  });
});
