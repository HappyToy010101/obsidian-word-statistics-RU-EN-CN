# Module extraction plan

This plugin's current `main.ts` is a bundled artifact (contains helper wrappers like `__commonJS`, `__copyProps`, etc.). To safely improve structure without breaking runtime, we'll migrate to a modular layout incrementally.

Target modules (no behavior changes):
- lemmatizer.ts — Lemmatizer class and dictionary parsing logic
- chineseSegmenter.ts — Chinese segmenter and dictionary parsing
- languageManager.ts — Orchestration over language tools; depends on the plugin instance
- view/WordStatisticsView.ts — View logic for stats UI
- i18n/translations.ts — TRANSLATIONS map
- data/poem.ts — POEM_CONTENT and EXPECTED_STATS test data

Step-by-step (safe) extraction:
1) Keep `main.ts` as the Obsidian entry. Do not change `manifest.json`.
2) Copy each class verbatim into its module file under `src/` and export it.
3) Replace the class definition in `main.ts` with an import from the new module.
4) Build and test (`npm run build`). Obsidian loads `main.js` which `require`s the new `./src/...` files.
5) Repeat for the next class.

Build is already prepared for `src/**/*.ts` via `tsconfig.build.json`. No bundler is required; TypeScript will emit CommonJS modules side-by-side.

Notes:
- Avoid renaming methods or changing behavior during extraction.
- Keep `// @ts-nocheck` in `main.ts` during the split to avoid blocking emits.
- After full extraction, gradually enable type checking per module and add types.
