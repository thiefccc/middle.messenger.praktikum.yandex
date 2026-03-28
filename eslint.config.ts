import globals from "globals";
import tseslint from "typescript-eslint";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: globals.browser },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error"
    }
  },
  tseslint.configs.recommended,
  js.configs.recommended,
]);
