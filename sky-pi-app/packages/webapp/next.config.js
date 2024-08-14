import path from "path";
import url from "url";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
  experimental: {
    // this includes files from the monorepo's root
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
};

export default config;
