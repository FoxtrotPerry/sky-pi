import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/screenshot.ts", // Entry point
  output: {
    dir: "dist", // Output file
    format: "cjs", // CommonJS format for Node.js
  },
  plugins: [
    typescript(),
    commonjs(), // Converts CommonJS modules to ES6
    resolve(), // Resolves node_modules
    json(), // Allows importing JSON files
  ],
};
