import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const resolveTypeScriptExtension = () => ({
  name: "resolve-typescript-extension",
  enforce: "pre" as const,
  resolveId(source: string, importer?: string) {
    if (!importer) {
      return null;
    }
    if (!source.startsWith(".") || !source.endsWith(".js")) {
      return null;
    }
    const importerPath = importer.startsWith("file://") ? fileURLToPath(importer) : importer;
    const candidate = path.resolve(path.dirname(importerPath), source.replace(/\.js$/, ".ts"));
    return fs.existsSync(candidate) ? candidate : null;
  }
});

export default defineConfig({
  css: {
    postcss: {
      plugins: []
    }
  },
  plugins: [resolveTypeScriptExtension()],
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    coverage: {
      reporter: ["text", "html"],
      reportsDirectory: "./coverage"
    }
  }
});
