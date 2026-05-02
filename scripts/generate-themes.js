/**
 * Generates src/theme/themes-tokens.js and src/theme/styles-content.js from @carbon/themes.
 *
 * Run via: npm run generate:themes
 *
 * Add new --cu-* tokens by extending TOKEN_MAP. Tokens that have no Carbon
 * equivalent (axis, grid) are handled in DERIVED below.
 */

import { white, g10, g90, g100 } from "@carbon/themes";
import { writeFileSync } from "fs";

/**
 * Maps each --cu-* CSS custom property to its @carbon/themes camelCase key.
 * Order here determines order in the generated output.
 */
const TOKEN_MAP = {
  "--cu-background": "background",
  "--cu-layer-01": "layer01",
  "--cu-layer-02": "layer02",
  "--cu-text-primary": "textPrimary",
  "--cu-text-secondary": "textSecondary",
  "--cu-text-helper": "textHelper",
  "--cu-border-subtle": "borderSubtle01",
  "--cu-border-subtle-02": "borderSubtle02",
  "--cu-axis": "borderStrong01",
  "--cu-interactive": "interactive",
  "--cu-support-error": "supportError",
  "--cu-support-warning": "supportWarning",
  "--cu-support-success": "supportSuccess",
  "--cu-support-info": "supportInfo",
};

/**
 * Tokens with no Carbon equivalent — derived per theme.
 * --cu-layer is a contextual alias; --cu-grid uses a semi-transparent overlay
 * so it reads correctly on any layer surface.
 */
const DERIVED = {
  white: { "--cu-layer": "var(--cu-layer-01)", "--cu-grid": "rgba(0,0,0,0.07)" },
  g10: { "--cu-layer": "var(--cu-layer-01)", "--cu-grid": "rgba(0,0,0,0.07)" },
  g90: { "--cu-layer": "var(--cu-layer-01)", "--cu-grid": "rgba(255,255,255,0.09)" },
  g100: { "--cu-layer": "var(--cu-layer-01)", "--cu-grid": "rgba(255,255,255,0.07)" },
};

const CARBON_THEMES = { white, g10, g90, g100 };

const carbonVersion = (await import("@carbon/themes/package.json", { with: { type: "json" } }))
  .default.version;

/** Converts a camelCase Carbon key to its --cds-* CSS variable name. */
function toCdsVar(carbonKey) {
  const kebab = carbonKey
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .toLowerCase();
  return `--cds-${kebab}`;
}

function buildTheme(name, source) {
  const mapped = Object.fromEntries(
    Object.entries(TOKEN_MAP).map(([cssVar, carbonKey]) => [cssVar, source[carbonKey]]),
  );
  return { ...mapped, ...DERIVED[name] };
}

/** themes-tokens.js */
const themes = Object.fromEntries(
  Object.entries(CARBON_THEMES).map(([name, source]) => [name, buildTheme(name, source)]),
);

const tokensOutput = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Re-generate by running: npm run generate:themes
 *
 * Source: @carbon/themes ${carbonVersion}
 */
export const THEMES = ${JSON.stringify(themes, null, 2)};
`;

writeFileSync(new URL("../src/theme/themes-tokens.js", import.meta.url), tokensOutput);
console.log("Generated src/theme/themes-tokens.js");

/** styles-content.js — CSS string for runtime injection */
const mappedRules = Object.entries(TOKEN_MAP)
  .map(([cuVar, carbonKey]) => `  ${cuVar}: var(${toCdsVar(carbonKey)}, ${themes.white[cuVar]});`)
  .join("\n");

const defaultGrid = DERIVED.white["--cu-grid"];
const gridOverrides = Object.entries(DERIVED)
  .filter(([, tokens]) => tokens["--cu-grid"] !== defaultGrid)
  .map(([name, tokens]) => `.cds--${name} {\n  --cu-grid: ${tokens["--cu-grid"]};\n}`)
  .join("\n\n");

const tileRule = `.cds--tile {\n  --cu-tooltip-bg: var(--cu-layer-01);\n}`;

const selectRule = [
  `.u-select {`,
  `  background: rgba(15, 98, 254, 0.1);`,
  `  border-left: 1px solid rgba(15, 98, 254, 0.5);`,
  `  border-right: 1px solid rgba(15, 98, 254, 0.5);`,
  `}`,
  ``,
  `.cds--g90 .u-select,`,
  `.cds--g100 .u-select {`,
  `  background: rgba(69, 137, 255, 0.2);`,
  `  border-left: 1px solid rgba(69, 137, 255, 0.65);`,
  `  border-right: 1px solid rgba(69, 137, 255, 0.65);`,
  `}`,
].join("\n");

const cssContent = `:root {\n${mappedRules}\n  --cu-layer: var(--cu-layer-01);\n  --cu-grid: ${defaultGrid};\n}\n\n${gridOverrides}\n\n${tileRule}\n\n${selectRule}\n`;

const stylesContentOutput = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Re-generate by running: npm run generate:themes
 *
 * Source: @carbon/themes ${carbonVersion}
 */
export const STYLES_CONTENT = ${JSON.stringify(cssContent)};
`;

writeFileSync(new URL("../src/theme/styles-content.js", import.meta.url), stylesContentOutput);
console.log("Generated src/theme/styles-content.js");
