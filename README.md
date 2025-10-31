# Word Statistics RU/EN/CN — Obsidian Plugin

Advanced word statistics for Russian, English, and Chinese with lemmatization/segmentation, interactive charts, and smart filtering.

> Alpha status: actively evolving. Expect rapid improvements and occasional changes.

## Features

- 📊 Word frequency analysis for Russian, English, and Chinese
- 🧠 Lemmatization (RU/EN) and segmentation (ZH)
- 📈 Interactive chart view and full table view
- 🎛️ Rich settings: content filtering, exclude common words, custom exclusions
- ⚡ Caching for faster reloads, batched processing to keep UI responsive
- 🌐 Fully localized UI (RU/EN/ZH)
- 🧪 Built‑in strict test with reference poem for quick validation
- 💾 Export results to CSV/JSON (filtered), plus quick "Export All" from the panel

## Installation

## Installation Methods

### Method 1: Using BRAT Plugin (Recommended)

1. **Install BRAT plugin** in Obsidian:
   - Go to Settings → Community plugins → Browse
   - Search for "BRAT" and install it
   - Enable BRAT plugin

2. **Add this plugin to BRAT**:
   - Open Command Palette (`Ctrl+P` / `Cmd+P`)
   - Run: `BRAT: Add a beta plugin`
   - Paste this URL:
     ```
   https://github.com/HappyToy010101/obsidian-word-statistics-RU-EN-CN
     ```
   - Click "Add Plugin"

3. **Enable the plugin**:
   - Go to Settings → Community plugins
   - Find "Word Statistics RU EN CN" in disabled plugins list
   - Enable it

### Method 2: Manual Installation

1. **Download the plugin files**:
   - Go to: `https://github.com/HappyToy010101/obsidian-word-statistics-RU-EN-CN`
   - Download the entire repository as ZIP
   - Or clone the repository

2. **Extract to your vault**:
   - Navigate to your vault folder: `YourVault/.obsidian/plugins/`
   - Create folder: `word-statistics-ru-en-cn`
   - Copy these files into the folder:
     - `main.js`
     - `manifest.json` 
     - `styles.css`

3. **Enable the plugin**:
   - Restart Obsidian
   - Go to Settings → Community plugins
   - Enable "Word Statistics RU EN CN"

### Method 3: Using GitHub with BRAT (Alternative)

1. **Install BRAT plugin** (as in Method 1)

2. **Add using GitHub repository**:
   - In BRAT settings, click "Add Plugin"
   - Select "Using GitHub repository name"
   - Enter: `HappyToy010101/obsidian-word-statistics-RU-EN-CN`
   - Click "Add Plugin"

## File Structure Required

```
YourVault/.obsidian/plugins/
└── word-statistics-ru-en-cn/
    ├── main.js
    ├── manifest.json
    ├── styles.css
   └── (optional) data.json
```

## Usage

1) Click the 📊 ribbon icon to open the Word Statistics view.
2) Choose language (🇷🇺/🇺🇸/🇨🇳) and adjust “Exclude top words”.
3) Click “Refresh Statistics” to analyze your vault.
4) Switch between table and chart views anytime.
5) Export results using the CSV/JSON buttons in the header; files open automatically after export and are saved to your vault root.

Tips
- Add your own words to ignore via the “Add user words to exclude” input.
- Use content filtering options to ignore Markdown/code/links/math.
- The “Longest word” and “Last updated” badges summarize the run.

## Troubleshooting

**If plugin doesn't appear:**
- Restart Obsidian completely
- Check folder structure matches exactly
- Verify all three required files are present
- Check console for errors (Ctrl+Shift+I)

**If features don't work:**
- Ensure dictionaries load (check console)
- Try refreshing statistics
- Verify language setting matches your content

## Settings overview

- Language: RU / EN / ZH
- Minimum word length: ignore very short tokens
- Exclude top common words: percentage‑based removal of frequent words
- Content filtering: ignore Markdown/code/URLs/math/tags
- Additional excluded words: comma‑separated list
- Caching: persist stats between sessions
- Tools: reload dictionaries, create a test file, view expected stats, run strict test

## Developer quick start (optional)

The repo includes a TypeScript pipeline; Obsidian still loads CommonJS `main.js`.

```powershell
# From the plugin folder
npm install
npm run build        # emit JS from TS sources (updates main.js)
npm run build:watch  # auto‑rebuild on save
npm run typecheck    # no‑emit type checking
```

Structure highlights
- Entry source: `main.ts` (emits `main.js`)
- Modules: `src/constants.ts`, `src/lemmatizer.ts`, `src/chineseSegmenter.ts`, `src/languageManager.ts`, `src/i18n/translations.ts`, `src/data/poem.ts`
- Types: `types/obsidian-shim.d.ts` for editor IntelliSense

## Language support

- Russian: dictionary‑based lemmatization
- English: dictionary‑based lemmatization
- Chinese: optimized word segmentation

## Run the strict test

Open Settings → Word Statistics → “Run Strict Test”. The test processes a reference poem in RU/EN/ZH and validates totals, uniques, and top words with a small tolerance. Use this to sanity‑check dictionaries and segmentation.

## Support

Report issues and suggestions on GitHub:
- Obsidian version
- Plugin version
- Steps to reproduce and any console errors

## License

MIT License

---

Screenshots: Coming soon (chart + table view, settings).

— Alpha build —