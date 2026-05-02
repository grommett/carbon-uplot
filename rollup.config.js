import { readFileSync } from "fs";
import terser from "@rollup/plugin-terser";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

const outputs = (esm, cjs) => [
  { file: esm, format: "esm", plugins: [terser()] },
  { file: cjs, format: "cjs", exports: "named", plugins: [terser()] },
];

export default [
  {
    input: "src/index.js",
    external: ["uplot"],
    output: outputs(pkg.exports["."].import, pkg.exports["."].require),
  },
  {
    input: "src/react.js",
    external: ["uplot", "react"],
    output: outputs(pkg.exports["./react"].import, pkg.exports["./react"].require),
  },
  {
    input: "src/web-components.js",
    external: ["uplot"],
    output: outputs(pkg.exports["./web-components"].import, pkg.exports["./web-components"].require),
  },
];
