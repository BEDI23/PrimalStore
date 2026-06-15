import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    // Environnement node par défaut (tests unitaires lib/). Les tests de
    // composants déclarent `// @vitest-environment jsdom` en tête de fichier.
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: [
      "lib/**/*.test.ts",
      "tests/**/*.test.ts",
      "components/**/*.test.tsx",
    ],
  },
});
