import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
  input: ["src/download.ts", "src/screenshot.ts"],
  output: {
    dir: "dist", // Output file
    format: "cjs", // CommonJS format for Node.js
  },
  plugins: [
    typescript(), // Converts ts to js
    commonjs(), // Converts CommonJS modules to ES6
    resolve(), // Resolves node_modules
    json(), // Allows importing JSON files
    terser(), // Minify bundle
  ],
};
