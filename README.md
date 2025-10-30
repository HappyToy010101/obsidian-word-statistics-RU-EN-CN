# Word Statistics RU/EN/CN - Obsidian Plugin

**Alpha version** - Advanced word statistics with multi-language support


**ALPHA ALPHA ALPHA ALPHA ALPHA ALPHA ALPHA ALPHA ALPHA ALPHA ALPHA ALPHA ALPHA ALPHA ALPHA ALPHA ALPHA ALPHA**

## Features

- 📊 Word frequency analysis for Russian, English, and Chinese
- 🧠 Smart lemmatization and word segmentation
- 📈 Interactive charts and detailed statistics
- ⚡ Real-time processing with caching
- 🎯 Customizable word exclusion and filtering

# Word Statistics RU/EN/CN - Installation Guide

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
     https://github.com/HappyToy010101/word-statistics-RU-EN-CN
     ```
   - Click "Add Plugin"

3. **Enable the plugin**:
   - Go to Settings → Community plugins
   - Find "Word Statistics RU EN CN" in disabled plugins list
   - Enable it

### Method 2: Manual Installation

1. **Download the plugin files**:
   - Go to: `https://github.com/HappyToy010101/word-statistics-RU-EN-CN`
   - Download the entire repository as ZIP
   - Or clone the repository

2. **Extract to your vault**:
   - Navigate to your vault folder: `YourVault/.obsidian/plugins/`
   - Create folder: `word-statistics-RU-EN-CN`
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
   - Enter: `HappyToy010101/word-statistics-RU-EN-CN`
   - Click "Add Plugin"

## File Structure Required

```
YourVault/.obsidian/plugins/
└── word-statistics-RU-EN-CN/
    ├── main.js
    ├── manifest.json
    ├── styles.css
    └── (optional) data.json
```

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

## Alpha Version Notice

**Current: Alpha version** - Core functionality implemented

**Next version:** Dictionary updates and bug fixes

**Report issues:** Please create issues on GitHub repository with:
- Obsidian version
- Error messages from console
- Steps to reproduce the problem

---

*Note: This plugin is only available via GitHub until official community plugin approval.*

## Quick Start

1. Click the ribbon icon 📊
2. Select your language (Russian/English/Chinese)
3. Click "Refresh Statistics"
4. Switch between table and chart views

## Language Support

- **Russian**: Advanced lemmatization with case/verb normalization
- **English**: Dictionary-based word form normalization
- **Chinese**: Optimized word segmentation for modern text

## Settings

- Minimum word length filtering
- Exclude common words (0-100%)
- Content filtering (markdown, code, URLs, etc.)
- Custom word exclusion lists
- Enable/disable caching

## Alpha Version Notice

This is an **alpha release**. Some features may be experimental and require further testing.

**Next version focus:**
- Update and expand dictionaries
- Fix reported bugs
- Improve segmentation accuracy

## Support

Report issues and suggestions on GitHub. Please include:
- Obsidian version
- Plugin version
- Detailed description of the issue

## License

MIT License

---

*Alpha version - Use with caution*