import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"

export default tseslint.config(
  { ignores: ["dist"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // typescript-eslint v8 turned `prefer-const` on by default; keep it off so
      // the upgrade does not add new failures to code we are not touching.
      "prefer-const": "off",
      // Restore the v7 defaults (v8 changed ignoreRestSiblings to false and
      // caughtErrors to "all"), and allow underscore-prefixed throwaways.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
          ignoreRestSiblings: true,
        },
      ],
      // Only the two classic hook rules are enabled. eslint-plugin-react-hooks v7
      // also ships React Compiler rules (purity, immutability, set-state-in-effect,
      // ...) which report a large number of pre-existing violations that need real
      // refactors, not lint fixes. Enable them in a dedicated follow-up.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Non-TypeScript sources are not linted, matching the previous `--ext ts,tsx`
    // behaviour. src/serviceWorker.js is a build-time template.
    ignores: ["**/*.js", "**/*.cjs", "**/*.mjs"],
  },
)
