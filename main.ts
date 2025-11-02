// @ts-nocheck
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// main.js
var import_obsidian = require("obsidian");
import { DICTIONARY_URLS, DEFAULT_DICTIONARIES, PREPOSITIONS } from "./src/constants";
import { Lemmatizer } from "./src/lemmatizer";
import { ChineseSegmenter } from "./src/chineseSegmenter";
import { LanguageManager } from "./src/languageManager";
import { TRANSLATIONS } from "./src/i18n/translations";
import { POEM_CONTENT, EXPECTED_STATS } from "./src/data/poem";
import { validateDictionaries } from "./src/utils/dictionaryValidator";

// Precompiled regex patterns for markdown cleaning (micro-optimization)
const FRONTMATTER_RE = /^---\s*\n[\s\S]*?\n---\s*\n?/m;
const CODE_BLOCK_RE = /```[\s\S]*?```/g;
const INLINE_CODE_RE = /`[^`\n]+`/g;
const MATH_BLOCK_RE = /\$\$[\s\S]*?\$\$/g;
const INLINE_MATH_RE = /\$[^$\n]+\$/g;
const URL_RE = /https?:\/\/[^\s\)]+/g;
const MARKDOWN_LINK_RE = /\[([^\]]+)\]\([^)]+\)/g;
const WIKI_LINK_RE = /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g;
const TAG_RE1 = /#[\w\u0400-\u04FF\/-]+/g;
const TAG_RE2 = /@[\w\u0400-\u04FF\/-]+/g;
const HEADERS_RE = /^#{1,6}\s+/gm;
const LIST_RE = /^[\s]*([-*+]|\d+\.)\s+/gm;
const BOLD_RE = /(\*\*|__)(.*?)\1/g;
const ITALIC_RE = /(\*|_)(.*?)\1/g;
const STRIKE_RE = /~~(.*?)~~/g;
const QUOTE_RE = /^>\s+/gm;
const HRULE_RE = /^[\s]*[-*_]{3,}[\s]*$/gm;
const TABLE_ROW_RE = /^\|.*\|$/gm;
const TABLE_DIVIDER_RE = /^\|[-:\s|]+\|$/gm;
const HTML_TAG_RE = /<[^>]+>/g;
const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;

// Default dictionaries moved to src/constants.ts

/**
 * Lemmatizer class for word form reduction to base forms
 * Supports loading dictionaries from GitHub or using fallback defaults
 */
// Lemmatizer moved to src/lemmatizer.ts

/**
 * Chinese text segmenter for breaking Chinese text into words
 * Uses maximum matching algorithm with dictionary lookup
 */
// ChineseSegmenter moved to src/chineseSegmenter.ts
// ChineseSegmenter moved to src/chineseSegmenter.ts

/**
 * Language Manager - Coordinates lemmatizers and word extraction for different languages
 */
// LanguageManager moved to src/languageManager.ts
// LanguageManager moved to src/languageManager.ts

// Poem content and expected stats moved to src/data/poem.ts

// Enhanced Test System with improved validation
class EnhancedTestSystem {
    constructor(plugin) {
        this.plugin = plugin;
        this.testResults = new Map();
    }

    async runStrictTest() {
        console.log("🧪 Running STRICT lemmatization test (current language only)...");

        // Only test the CURRENT language to avoid loading extra dictionaries
        const currentLang = this.plugin.settings.language;
        const CASES = {
            russian: {
                name: "Russian Lemmatization",
                language: "russian",
                text: POEM_CONTENT.russian,
                expected: EXPECTED_STATS.russian,
                tolerance: { total: 2, unique: 3 }
            },
            english: {
                name: "English Lemmatization",
                language: "english",
                text: POEM_CONTENT.english,
                expected: EXPECTED_STATS.english,
                tolerance: { total: 2, unique: 3 }
            },
            chinese: {
                name: "Chinese Segmentation",
                language: "chinese",
                text: POEM_CONTENT.chinese,
                expected: EXPECTED_STATS.chinese,
                tolerance: { total: 5, unique: 5 }
            }
        };

        const testCase = CASES[currentLang] || CASES.russian;

        // For Chinese test ensure deterministic settings (dictionary mode, no heuristics, min length = 1)
        const restoreSettings: any = {};
        if (testCase.language === 'chinese') {
            try {
                restoreSettings.chineseSegmentation = this.plugin.settings.chineseSegmentation;
                restoreSettings.chineseContextHeuristics = this.plugin.settings.chineseContextHeuristics;
                restoreSettings.chineseAdjectivalHeuristics = this.plugin.settings.chineseAdjectivalHeuristics;
                restoreSettings.minWordLength = this.plugin.settings.minWordLength;
                restoreSettings.ignorePrepositions = this.plugin.settings.ignorePrepositions;

                let needReload = false;
                if (this.plugin.settings.chineseSegmentation !== 'dictionary') {
                    this.plugin.settings.chineseSegmentation = 'dictionary';
                    needReload = true;
                }
                // Disable heuristics for strict, reproducible counts
                this.plugin.settings.chineseContextHeuristics = false;
                this.plugin.settings.chineseAdjectivalHeuristics = false;
                // Ensure single-char tokens like “的” are counted
                this.plugin.settings.minWordLength = 1;
                // Do not exclude particles in strict test evaluation
                this.plugin.settings.ignorePrepositions = false;

                if (needReload) {
                    // Reload CN dictionaries/segmenter to apply mode change
                    await this.plugin.languageManager.reloadDictionaries();
                }
            } catch (e) {
                console.warn('Failed to adjust settings for strict CN test:', e);
            }
        }

        const results = [];
        let passedTests = 0;
        let totalTests = 0;

        totalTests++;
        console.log(`🔬 Testing: ${testCase.name}`);

        try {
            // Ensure ONLY the needed language tools are initialized
            await this.plugin.languageManager.ensureLanguageLoaded(testCase.language);

            // Process test text using the language manager directly to avoid changing settings
            const words = this.plugin.languageManager.extractWords(testCase.text, testCase.language, "");
            const wordStats = new Map();

            words.forEach(word => {
                wordStats.set(word, (wordStats.get(word) || 0) + 1);
            });

            // Check totals
            const totalWords = words.length;
            const uniqueWords = wordStats.size;

            // Check top words - take as many as expected
            const topWords = Array.from(wordStats.entries())
                .sort(([,a], [,b]) => b - a)
                .slice(0, testCase.expected.topWords.length)
                .map(([word, count]) => ({ word, count }));

            // Validation with tolerance
            const totalWordsMatch = Math.abs(totalWords - testCase.expected.totalWords) <= testCase.tolerance.total;
            const uniqueWordsMatch = Math.abs(uniqueWords - testCase.expected.uniqueWords) <= testCase.tolerance.unique;

            // Required top words present
            let topWordsMatch = true;
            let missingWords = [];

            testCase.expected.topWords.forEach(expectedWord => {
                const foundWord = topWords.find(actualWord => actualWord.word === expectedWord.word);
                if (!foundWord) {
                    topWordsMatch = false;
                    missingWords.push(expectedWord.word);
                } else if (Math.abs(foundWord.count - expectedWord.count) > 2) {
                    console.log(`   Count mismatch for "${expectedWord.word}": expected ${expectedWord.count}, got ${foundWord.count}`);
                }
            });

            const passed = totalWordsMatch && uniqueWordsMatch && topWordsMatch;

            if (passed) {
                passedTests++;
                console.log(`✅ ${testCase.name}: PASSED`);
                console.log(`   Total: ${totalWords} (expected ${testCase.expected.totalWords})`);
                console.log(`   Unique: ${uniqueWords} (expected ${testCase.expected.uniqueWords})`);
            } else {
                console.log(`❌ ${testCase.name}: FAILED`);
                console.log(`   Expected: ${testCase.expected.totalWords} total, ${testCase.expected.uniqueWords} unique`);
                console.log(`   Got: ${totalWords} total, ${uniqueWords} unique`);
                if (missingWords.length > 0) {
                    console.log(`   Missing words: ${missingWords.join(', ')}`);
                }
                console.log(`   Expected top words:`, testCase.expected.topWords);
                console.log(`   Actual top words:`, topWords);
            }

            results.push({
                name: testCase.name,
                passed,
                details: {
                    totalWords: { expected: testCase.expected.totalWords, actual: totalWords },
                    uniqueWords: { expected: testCase.expected.uniqueWords, actual: uniqueWords },
                    topWords: { expected: testCase.expected.topWords, actual: topWords },
                    missingWords
                }
            });

        } catch (error) {
            console.error(`💥 ${testCase.name}: ERROR`, error);
            results.push({
                name: testCase.name,
                passed: false,
                error: error.message
            });
        }

        // Restore settings if we modified them for CN test
        if (testCase.language === 'chinese') {
            try {
                const prev = restoreSettings;
                const modeChanged = this.plugin.settings.chineseSegmentation !== prev.chineseSegmentation;
                this.plugin.settings.chineseSegmentation = prev.chineseSegmentation;
                this.plugin.settings.chineseContextHeuristics = prev.chineseContextHeuristics;
                this.plugin.settings.chineseAdjectivalHeuristics = prev.chineseAdjectivalHeuristics;
                this.plugin.settings.minWordLength = prev.minWordLength;
                this.plugin.settings.ignorePrepositions = prev.ignorePrepositions;
                if (modeChanged) {
                    await this.plugin.languageManager.reloadDictionaries();
                }
            } catch (e) {
                console.warn('Failed to restore settings after strict CN test:', e);
            }
        }

        // Final verdict for a single test
        const successRate = (passedTests / totalTests) * 100;
        console.log(`📊 Test Results: ${passedTests}/${totalTests} passed (${successRate.toFixed(1)}%)`);

        if (successRate < 80) {
            throw new Error(`🚨 CRITICAL TEST FAILURE: Only ${successRate.toFixed(1)}% of tests passed!`);
        } else if (successRate < 95) {
            console.warn(`⚠️  WARNING: ${successRate.toFixed(1)}% test pass rate - some features may not work correctly`);
        } else {
            console.log(`🎉 EXCELLENT: ${successRate.toFixed(1)}% test pass rate - looks good!`);
        }

        return {
            successRate,
            passedTests,
            totalTests,
            results
        };
    }
}

// Translations moved to src/i18n/translations.ts

// Word Statistics View with Linear Chart
var WordStatisticsView = class extends import_obsidian.ItemView {
    constructor(leaf, plugin) {
        super(leaf);
    this.eventListeners = new Map();
        this.infoEl = null;
        this.listContainer = null;
        this.displayMode = "table";
        this.plugin = plugin;
        this.chart = null;
        this.chartResizeObserver = null;
    }

    getViewType() {
        return "word-stats-view";
    }

    getDisplayText() {
        return this.t("title");
    }

    t(key, ...params) {
        const translation = TRANSLATIONS[this.plugin.settings.language][key];
        return typeof translation === "function" ? translation(...params) : translation;
    }

    async onOpen() {
        // Lazy-load cached stats on first open to avoid work during app startup
        try {
            if (this.plugin.settings.enableCaching && this.plugin.allStats.size === 0) {
                await this.plugin.loadCachedStats();
            }
        } catch (e) {
            console.warn('Cache load on view open skipped:', e);
        }
        await this.drawStats();
    }

    clearEventListeners() {
        try {
            let total = 0;
            for (const [element, listeners] of this.eventListeners) {
                if (!element || typeof element.removeEventListener !== 'function') continue;
                for (const l of listeners) {
                    try {
                        element.removeEventListener(l.event, l.callback, l.options ?? false);
                        total++;
                    } catch (e) {
                        console.warn("Failed removing listener", l.event, e);
                    }
                }
            }
            this.eventListeners.clear();
            console.log(`🧹 Cleared ${total} event listeners`);
        } catch (error) {
            console.error("Error clearing event listeners:", error);
        }
    }

    addEventListener(element, event, callback, options) {
        try {
            if (!element || typeof element.addEventListener !== 'function') {
                console.warn("Invalid element for event listener:", element);
                return;
            }
            
            element.addEventListener(event, callback, options ?? false);
            const arr = this.eventListeners.get(element) ?? [];
            arr.push({ event, callback, options });
            this.eventListeners.set(element, arr);
        } catch (error) {
            console.error("Error adding event listener:", error);
        }
    }

    showProgress(current, total) {
        const container = this.containerEl.children[1];
        container.empty();
        const progressEl = container.createEl("div", { cls: "word-stats-progress" });
        progressEl.createEl("div", {
            text: this.t("processing", current, total)
        });
        const progressBar = progressEl.createEl("div", { cls: "word-stats-progress-bar" });
        progressBar.createEl("div", {
            cls: "word-stats-progress-fill",
            attr: { style: `width: ${(current / total) * 100}%` }
        });
    }

    updateProgress(current, total) {
        const progressEl = this.containerEl.querySelector(".word-stats-progress");
        if (progressEl) {
            const textEl = progressEl.querySelector("div");
            const fillEl = progressEl.querySelector(".word-stats-progress-fill");
            if (textEl)
                textEl.setText(this.t("processing", current, total));
            if (fillEl)
                fillEl.style.width = `${(current / total) * 100}%`;
        }
    }

    async drawStats() {
        this.clearEventListeners();
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        // Clean up existing ResizeObserver
        if (this.chartResizeObserver) {
            this.chartResizeObserver.disconnect();
            this.chartResizeObserver = null;
        }
        
        const container = this.containerEl.children[1];
        container.empty();

        const statsEl = container.createEl("div", { cls: "word-stats-container" });
        const headerEl = statsEl.createEl("div", { cls: "word-stats-header" });
        
        // Title with icon
        const titleEl = headerEl.createEl("div", { cls: "word-stats-title-container" });
        titleEl.createEl("span", { cls: "word-stats-icon" }).innerHTML = "📊";
        titleEl.createEl("h3", { text: this.t("title"), cls: "word-stats-title" });

        const buttonsContainer = headerEl.createEl("div", { cls: "word-stats-buttons" });
        
        const refreshButton = buttonsContainer.createEl("button", {
            text: "🔄 " + this.t("refresh"),
            cls: "word-stats-btn word-stats-btn-primary"
        });
        
        const viewToggleButton = buttonsContainer.createEl("button", {
            text: this.displayMode === "table" ? "📈 " + this.t("showChart") : "📋 " + this.t("showTable"),
            cls: "word-stats-btn word-stats-btn-secondary"
        });

        // Export buttons
        const exportCsvButton = buttonsContainer.createEl("button", {
            text: "📤 " + this.t("exportCSV"),
            cls: "word-stats-btn"
        });
        const exportJsonButton = buttonsContainer.createEl("button", {
            text: "🗂️ " + this.t("exportJSON"),
            cls: "word-stats-btn"
        });
        const exportAllButton = buttonsContainer.createEl("button", {
            text: "📦 " + this.t("exportAll"),
            cls: "word-stats-btn"
        });

        this.addEventListener(refreshButton, "click", async () => {
            refreshButton.setText("⏳ " + this.t("refreshing"));
            refreshButton.setAttribute("disabled", "true");
            viewToggleButton.setAttribute("disabled", "true");
            try {
                await this.plugin.collectAllStats();
                await this.drawStats();
                this.showStyledNotice("✅ " + this.t("dict_loaded"), 'success');
            } catch (error) {
                this.showStyledNotice("❌ " + this.t("errorRefreshing"), 'error');
                console.error("Error refreshing statistics:", error);
            } finally {
                refreshButton.setText("🔄 " + this.t("refresh"));
                refreshButton.removeAttribute("disabled");
                viewToggleButton.removeAttribute("disabled");
            }
        });

        this.addEventListener(viewToggleButton, "click", () => {
            this.displayMode = this.displayMode === "table" ? "chart" : "table";
            viewToggleButton.setText(this.displayMode === "table" ? "📈 " + this.t("showChart") : "📋 " + this.t("showTable"));
            this.updateStatsDisplay();
        });

        this.addEventListener(exportCsvButton, "click", async () => {
            try {
                const path = await this.plugin.exportStats("csv", "filtered");
                this.showStyledNotice("✅ " + this.t("exportSuccess", path), 'success');
            } catch (e) {
                this.showStyledNotice("❌ " + this.t("exportError"), 'error');
                console.error("Export CSV error:", e);
            }
        });

        this.addEventListener(exportJsonButton, "click", async () => {
            try {
                const path = await this.plugin.exportStats("json", "filtered");
                this.showStyledNotice("✅ " + this.t("exportSuccess", path), 'success');
            } catch (e) {
                this.showStyledNotice("❌ " + this.t("exportError"), 'error');
                console.error("Export JSON error:", e);
            }
        });

        this.addEventListener(exportAllButton, "click", async () => {
            try {
                const path = await this.plugin.exportStats("csv", "all");
                this.showStyledNotice("✅ " + this.t("exportSuccess", path), 'success');
            } catch (e) {
                this.showStyledNotice("❌ " + this.t("exportError"), 'error');
                console.error("Export ALL error:", e);
            }
        });

        if (this.plugin.allStats.size === 0) {
            const loadingEl = statsEl.createEl("div", { cls: "word-stats-loading" });
            loadingEl.innerHTML = `
                <div class="word-stats-empty-state">
                    <div class="word-stats-empty-icon">📊</div>
                    <h3>${this.t("title")}</h3>
                    <p>${this.t("clickToGenerate")}</p>
                    <button class="word-stats-btn word-stats-btn-primary" id="initial-refresh">
                        🚀 ${this.t("refresh")}
                    </button>
                </div>
            `;
            
            const initialRefreshBtn = loadingEl.querySelector("#initial-refresh");
            this.addEventListener(initialRefreshBtn, "click", async () => {
                await this.plugin.collectAllStats();
                await this.drawStats();
            });
            
            return;
        }

        // Language selector with flag
        const languageContainer = statsEl.createEl("div", { cls: "word-stats-language-container" });
        languageContainer.createEl("label", {
            text: "🌍 " + this.t("language"),
            cls: "word-stats-language-label"
        });
        const languageSelect = languageContainer.createEl("select", {
            cls: "word-stats-language-select"
        });

        const languages = [
            { value: "russian", name: "RU Русский", flag: "RU" },
            { value: "english", name: "EN English", flag: "EN" },
            { value: "chinese", name: "CN 中文", flag: "CN" }
        ];

        languages.forEach((lang) => {
            const option = languageSelect.createEl("option", {
                value: lang.value,
                text: lang.name
            });
            if (lang.value === this.plugin.settings.language) {
                option.setAttribute("selected", "true");
            }
        });

        this.addEventListener(languageSelect, "change", async (e) => {
            const value = e.target.value;
            this.plugin.settings.language = value;
            await this.plugin.saveSettings(true);
            this.drawStats();
        });

        // Controls section
        const controlsEl = statsEl.createEl("div", { cls: "word-stats-controls" });
        
        // Slider for top words exclusion
        const sliderContainer = controlsEl.createEl("div", { cls: "word-stats-slider-container" });
        const currentLanguageName = this.plugin.getCurrentLanguageDisplayName();
        const sliderLabel = sliderContainer.createEl("label", {
            text: `🔝 ${this.t("excludeTopWords", this.plugin.settings.excludeTopWords, currentLanguageName)}`,
            cls: "word-stats-slider-label"
        });
        
        const sliderWrapper = sliderContainer.createEl("div", { cls: "word-stats-slider-wrapper" });
        const slider = sliderWrapper.createEl("input", {
            type: "range",
            cls: "word-stats-slider"
        });
        slider.setAttribute("min", "0");
        slider.setAttribute("max", "100");
        slider.setAttribute("value", this.plugin.settings.excludeTopWords.toString());
        slider.setAttribute("step", "1");

        const sliderValue = sliderWrapper.createEl("span", {
            text: this.plugin.settings.excludeTopWords + "%",
            cls: "word-stats-slider-value"
        });

        // Debounced filtering to avoid heavy work on every input tick
        let filterDebounce;
        this.addEventListener(slider, "input", (e) => {
            const value = e.target.value;
            this.plugin.settings.excludeTopWords = parseInt(value);
            sliderLabel.setText(`🔝 ${this.t("excludeTopWords", parseInt(value), currentLanguageName)}`);
            sliderValue.setText(value + "%");
            if (filterDebounce) clearTimeout(filterDebounce);
            filterDebounce = setTimeout(() => {
                this.plugin.updateFilteredStats();
                this.updateStatsDisplay();
            }, 150);
        });
        // Save setting once after interaction ends
        this.addEventListener(slider, "change", () => {
            this.plugin.saveSettings(false).catch(console.error);
        });

        // User words input
        const userWordsContainer = controlsEl.createEl("div", { cls: "word-stats-user-words" });
        userWordsContainer.createEl("label", {
            text: "✏️ " + this.t("addUserWords"),
            cls: "word-stats-user-words-label"
        });
        
        const userWordsInputContainer = userWordsContainer.createEl("div", {
            cls: "word-stats-user-words-input-container"
        });
        
        const userWordsInput = userWordsInputContainer.createEl("input", {
            type: "text",
            cls: "word-stats-user-words-input",
            attr: { placeholder: this.t("placeholder") }
        });
        
        const userWordsButton = userWordsInputContainer.createEl("button", {
            text: "➕ " + this.t("add"),
            cls: "word-stats-btn word-stats-user-words-button"
        });

        this.addEventListener(userWordsButton, "click", () => {
            const word = userWordsInput.value.trim();
            if (word) {
                this.plugin.addUserWord(word);
                userWordsInput.value = "";
                this.updateStatsDisplay();
                this.showStyledNotice(`✅ "${word}" ${this.t("add")}`, 'success');
            }
        });

        this.addEventListener(userWordsInput, "keypress", (e) => {
            if (e.key === "Enter") {
                const word = userWordsInput.value.trim();
                if (word) {
                    this.plugin.addUserWord(word);
                    userWordsInput.value = "";
                    this.updateStatsDisplay();
                    this.showStyledNotice(`✅ "${word}" ${this.t("add")}`, 'success');
                }
            }
        });

        if (this.plugin.userWords.size > 0) {
            const userWordsList = userWordsContainer.createEl("div", { cls: "word-stats-user-words-list" });
            userWordsList.createEl("div", {
                text: `🗑️ ${this.t("userWords", this.plugin.userWords.size)}`,
                cls: "word-stats-user-words-header"
            });
            
            const userWordsItems = userWordsList.createEl("div", { cls: "word-stats-user-words-items" });
            Array.from(this.plugin.userWords).forEach((word) => {
                const itemEl = userWordsItems.createEl("div", { cls: "word-stats-user-words-item" });
                itemEl.setText(word);
                const removeBtn = itemEl.createEl("button", {
                    text: "❌",
                    cls: "word-stats-user-words-remove"
                });
                this.addEventListener(removeBtn, "click", () => {
                    this.plugin.removeUserWord(word);
                    this.updateStatsDisplay();
                    this.showStyledNotice(`✅ "${word}" ${this.t("remove")}`, 'success');
                });
            });
        }

        // Info panel
        this.infoEl = statsEl.createEl("div", { cls: "word-stats-info" });
        
        // Stats display area
        this.listContainer = statsEl.createEl("div", { cls: "word-stats-list-container" });
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        if (!this.infoEl || !this.listContainer) return;
        
        this.updateInfoPanel();
        if (this.displayMode === "table") {
            this.updateWordList();
        } else {
            this.drawBeautifulChart();
        }
    }

    updateInfoPanel() {
        if (!this.infoEl) return;
        this.infoEl.empty();
        
        const filteredStats = this.plugin.filteredStats;
        const excludedCount = this.plugin.getExcludedWordsCount();
        const totalWordsAll = Array.from(this.plugin.allStats.values()).reduce((sum, stat) => sum + stat.count, 0);
        const totalWordsFiltered = Array.from(filteredStats.values()).reduce((sum, stat) => sum + stat.count, 0);

        const infoGrid = this.infoEl.createEl("div", { cls: "word-stats-info-grid" });
        
        // Total words card
        const totalCard = infoGrid.createEl("div", { cls: "word-stats-info-card" });
        totalCard.createEl("div", { cls: "word-stats-info-icon" }).innerHTML = "📦";
        totalCard.createEl("div", { cls: "word-stats-info-value", text: totalWordsAll.toLocaleString() });
        totalCard.createEl("div", { cls: "word-stats-info-label", text: this.t("totalWords") });

        // Filtered words card
        const filteredCard = infoGrid.createEl("div", { cls: "word-stats-info-card" });
        filteredCard.createEl("div", { cls: "word-stats-info-icon" }).innerHTML = "🎯";
        filteredCard.createEl("div", { cls: "word-stats-info-value", text: totalWordsFiltered.toLocaleString() });
        filteredCard.createEl("div", { cls: "word-stats-info-label", text: this.t("totalWordsFiltered") });

        // Unique words card
        const uniqueCard = infoGrid.createEl("div", { cls: "word-stats-info-card" });
        uniqueCard.createEl("div", { cls: "word-stats-info-icon" }).innerHTML = "✨";
        uniqueCard.createEl("div", { cls: "word-stats-info-value", text: this.plugin.allStats.size.toLocaleString() });
        uniqueCard.createEl("div", { cls: "word-stats-info-label", text: this.t("uniqueWords") });

        // Filtered unique words card
        const uniqueFilteredCard = infoGrid.createEl("div", { cls: "word-stats-info-card" });
        uniqueFilteredCard.createEl("div", { cls: "word-stats-info-icon" }).innerHTML = "⭐";
        uniqueFilteredCard.createEl("div", { cls: "word-stats-info-value", text: filteredStats.size.toLocaleString() });
        uniqueFilteredCard.createEl("div", { cls: "word-stats-info-label", text: this.t("uniqueWordsFiltered") });

        // Additional info
        const additionalInfo = this.infoEl.createEl("div", { cls: "word-stats-additional-info" });
        
        if (excludedCount > 0) {
            const excludedWordsCount = totalWordsAll - totalWordsFiltered;
            additionalInfo.createEl("div", {
                text: `🚫 ${this.t("excludedInfo", excludedCount, excludedWordsCount.toLocaleString())}`,
                cls: "word-stats-excluded-info"
            });
        }

        if (this.plugin.longestWord) {
            const lengthText = this.plugin.settings.language === "english" ? "letters" : 
                             this.plugin.settings.language === "russian" ? "букв" : "字母";
            additionalInfo.createEl("div", { 
                text: `📏 ${this.t("longestWord")} "${this.plugin.longestWord.word}" (${this.plugin.longestWord.length} ${lengthText})`,
                cls: "word-stats-longest-word"
            });
        }

        if (this.plugin.lastUpdate) {
            additionalInfo.createEl("div", {
                text: `🕒 ${this.t("lastUpdated")} ${new Date(this.plugin.lastUpdate).toLocaleString()}`,
                cls: "word-stats-last-updated"
            });
        }

        // Subtle badge for unknown words (opens dictionary trainer)
        try {
            const unkCount = this.plugin.getUnknownCount(this.plugin.settings.language);
            if (unkCount > 0) {
                const badge = additionalInfo.createEl("button", { cls: "word-stats-unknown-badge", text: this.t("unknown_badge", unkCount) });
                this.addEventListener(badge, "click", () => this.plugin.openUnknownWords());
            }
        } catch {}
    }

    updateWordList() {
        if (!this.listContainer) return;
        this.listContainer.empty();
        
        // УБИРАЕМ .slice(0, 100) чтобы показать ВСЕ слова
        const displayStats = Array.from(this.plugin.filteredStats.entries())
            .sort(([, a], [, b]) => b.count - a.count);
            // .slice(0, 100); // УДАЛЕНО: теперь показываем все слова

        const listHeader = this.listContainer.createEl("div", { cls: "word-stats-list-header" });
        listHeader.createEl("span", { text: "📝 " + this.t("word") });
        listHeader.createEl("span", { text: "🔢 " + this.t("count") });
        
        const listEl = this.listContainer.createEl("div", { cls: "word-stats-list" });

        displayStats.forEach(([key, stat], index) => {
            const itemEl = listEl.createEl("div", { cls: "word-stat-item" });
            
            const rankEl = itemEl.createEl("span", {
                cls: "word-stat-rank",
                text: `#${index + 1}`
            });
            
            const wordEl = itemEl.createEl("span", {
                cls: stat.isUserWord ? "word-stat-word user-word" : "word-stat-word",
                text: stat.baseForm
            });
            
            const countEl = itemEl.createEl("span", {
                cls: "word-stat-count",
                text: stat.count.toLocaleString()
            });

            // Add percentage bar
            const maxCount = displayStats[0]?.[1]?.count || 1;
            const percentage = (stat.count / maxCount) * 100;
            const barEl = itemEl.createEl("div", { cls: "word-stat-bar" });
            barEl.createEl("div", {
                cls: "word-stat-bar-fill",
                attr: { style: `width: ${percentage}%` }
            });
        });

        if (displayStats.length === 0) {
            const emptyState = this.listContainer.createEl("div", { cls: "word-stats-empty-state" });
            emptyState.innerHTML = `
                <div class="word-stats-empty-icon">📝</div>
                <h3>${this.t("noWords")}</h3>
                <p>${this.t("noWords")}</p>
            `;
        }
    }

    // NEW: Method for styled notices
    showStyledNotice(message, type = 'info') {
        const notice = new import_obsidian.Notice('', 4000);
        const noticeEl = notice.noticeEl;
        noticeEl.addClass('word-stats-notice');
        noticeEl.addClass(`word-stats-notice-${type}`);
        noticeEl.setText(message);
    }

    // UPDATED: Linear chart implementation with horizontal labels
    drawBeautifulChart() {
        if (!this.listContainer) return;
        this.listContainer.empty();
        
        // Берем только топ-100 слов для графика
        const displayStats = Array.from(this.plugin.filteredStats.entries())
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 100);

        if (displayStats.length === 0) {
            const emptyState = this.listContainer.createEl("div", { cls: "word-stats-empty-state" });
            emptyState.innerHTML = `
                <div class="word-stats-empty-icon">📊</div>
                <h3>${this.t("noWords")}</h3>
                <p>${this.t("noWords")}</p>
            `;
            return;
        }

        const chartContainer = this.listContainer.createEl("div", { 
            cls: "word-stats-chart-container" 
        });
        
        // Информация о графике
        const chartInfo = chartContainer.createEl("div", { cls: "word-stats-chart-info" });
        const chartStats = chartInfo.createEl("div", { cls: "word-stats-chart-stats" });
        
        chartStats.createEl("div", { 
            cls: "word-stats-chart-stat",
            text: `📊 ${this.t("chartWordsCount", displayStats.length)}` 
        });
        
        const maxCount = Math.max(...displayStats.map(([, stat]) => stat.count));
        const minCount = Math.min(...displayStats.map(([, stat]) => stat.count));
        
        chartStats.createEl("div", { 
            cls: "word-stats-chart-stat",
            text: `📈 ${this.t("chartMax", maxCount)}` 
        });
        
        chartStats.createEl("div", { 
            cls: "word-stats-chart-stat",
            text: `📉 ${this.t("chartMin", minCount)}` 
        });

        // Легенда
        const legend = chartInfo.createEl("div", { cls: "word-stats-chart-legend" });
        const legendItem = legend.createEl("div", { cls: "word-stats-legend-item" });
        legendItem.createEl("div", { 
            cls: "word-stats-legend-line",
            attr: { style: `background: var(--interactive-accent)` }
        });
    legendItem.createEl("span", { text: this.t("legendLabel") });

        // Обертка для canvas с горизонтальным скроллом
        const chartWrapper = chartContainer.createEl("div", { 
            cls: "word-stats-chart-wrapper"
        });
        
        const canvasContainer = chartWrapper.createEl("div", {
            cls: "word-stats-canvas-container"
        });
        
        const canvas = canvasContainer.createEl("canvas", {
            cls: "word-stats-line-chart"
        });

        // Элементы управления
        // Переносим кнопки зума внутрь обертки графика, чтобы они были закреплены относительно видимой области
        const zoomOverlay = chartWrapper.createEl("div", { cls: "word-stats-chart-zoom" });
        const zoomOut = zoomOverlay.createEl("button", {
            text: this.t("zoomOut"),
            cls: "word-stats-zoom-btn",
            attr: { title: this.t("zoomOut"), 'aria-label': this.t("zoomOut") }
        });
        const zoomIn = zoomOverlay.createEl("button", {
            text: this.t("zoomIn"), 
            cls: "word-stats-zoom-btn",
            attr: { title: this.t("zoomIn"), 'aria-label': this.t("zoomIn") }
        });
        const resetZoom = zoomOverlay.createEl("button", {
            text: this.t("resetZoom"),
            cls: "word-stats-zoom-btn",
            attr: { title: this.t("resetZoom"), 'aria-label': this.t("resetZoom") }
        });

        // Панель с остальными контролами под графиком (ползунок навигации)
        const chartControls = chartContainer.createEl("div", { cls: "word-stats-chart-controls" });
        
        // Ползунок для навигации
        const sliderContainer = chartControls.createEl("div", { 
            cls: "word-stats-slider-container", 
            attr: { style: "flex: 1; display: flex; align-items: center; gap: 10px;" } 
        });
        
        sliderContainer.createEl("span", { 
            text: "←",
            attr: { style: "color: var(--text-muted); font-size: 14px;" }
        });
        
        const slider = sliderContainer.createEl("input", {
            type: "range",
            cls: "word-stats-chart-slider"
        });
        slider.setAttribute("min", "0");
        slider.setAttribute("max", "100");
        slider.setAttribute("value", "0");
        slider.setAttribute("step", "1");
        
        sliderContainer.createEl("span", { 
            text: "→",
            attr: { style: "color: var(--text-muted); font-size: 14px;" }
        });

        // Отрисовка линейного графика
        this.createLineChart(canvas, displayStats, slider, zoomOut, zoomIn, resetZoom, chartWrapper);
    }

    createLineChart(canvas, displayStats, slider, zoomOut, zoomIn, resetZoom, chartWrapper) {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error("Не удалось получить контекст canvas");
            return;
        }

        // Настройки графика
        let zoomLevel = 1.0;
        let scrollPosition = 0;
        const minZoom = 0.5;
        const maxZoom = 3.0;
        const zoomStep = 0.2;

        // Рассчитываем базовые размеры
        const calculateDimensions = () => {
            const baseWidth = Math.max(1200, displayStats.length * 50);
            const effectiveWidth = baseWidth * zoomLevel;
            const height = 500; // Увеличил высоту для лучшего отображения подписей
            
            return { 
                width: effectiveWidth, 
                height, 
                baseWidth,
                effectiveWidth
            };
        };

        // Optimized chart drawing function with requestAnimationFrame scheduling
        let drawChartRaf = 0;
        const drawChart = () => {
            if (drawChartRaf) cancelAnimationFrame(drawChartRaf);
            drawChartRaf = requestAnimationFrame(() => {
                // Declare width/height outside try so catch can reference them safely
                let width = 0;
                let height = 0;
                try {
                    const dims = calculateDimensions();
                    width = dims.width;
                    height = dims.height;
                    
                    // Reset transform each frame and set DPR-aware transform
                    const dpr = window.devicePixelRatio || 1;
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    canvas.width = Math.max(1, Math.floor(width * dpr));
                    canvas.height = Math.max(1, Math.floor(height * dpr));
                    canvas.style.width = width + 'px';
                    canvas.style.height = height + 'px';
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    
                    // Clear canvas efficiently
                    ctx.clearRect(0, 0, width, height);
                    
                    // Cache theme colors once per draw
                    const styles = getComputedStyle(document.body);
                    const COLOR = {
                        bgPrimary: styles.getPropertyValue('--background-primary') || '#ffffff',
                        bgSecondary: styles.getPropertyValue('--background-secondary') || '#f5f5f5',
                        border: styles.getPropertyValue('--background-modifier-border') || '#dddddd',
                        textNormal: styles.getPropertyValue('--text-normal') || '#000000',
                        textMuted: styles.getPropertyValue('--text-muted') || '#666666',
                        accent: styles.getPropertyValue('--interactive-accent') || '#7e6df3',
                        accentHover: styles.getPropertyValue('--interactive-accent-hover') || '#5a4fc9'
                    };
                    
            // Если нет данных, выходим
            if (displayStats.length === 0) return;
            
            // Настройки отрисовки
            const padding = { top: 50, right: 40, bottom: 120, left: 80 }; // Увеличил bottom для подписей
            const graphWidth = Math.max(0, width - padding.left - padding.right);
            const graphHeight = Math.max(0, height - padding.top - padding.bottom);
            
            if (graphWidth <= 0 || graphHeight <= 0) return;
            
            // Данные для графика
            const counts = displayStats.map(([, stat]) => stat.count);
            const maxValue = Math.max(...counts);
            const minValue = Math.min(...counts);
            const valueRange = maxValue - minValue;
            
            // Рисуем фон
            ctx.fillStyle = COLOR.bgPrimary;
            ctx.fillRect(0, 0, width, height);
            
            // Рисуем сетку
            ctx.strokeStyle = COLOR.border;
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            
            // Горизонтальные линии сетки (значения Y)
            const horizontalLines = 5;
            for (let i = 0; i <= horizontalLines; i++) {
                const y = padding.top + (i * graphHeight / horizontalLines);
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(padding.left + graphWidth, y);
                ctx.stroke();
                
                // Подписи значений Y
                ctx.fillStyle = COLOR.textMuted;
                ctx.font = '12px Arial';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                const value = Math.round(maxValue - (i * valueRange / horizontalLines));
                ctx.fillText(value.toString(), padding.left - 10, y);
            }
            
            ctx.setLineDash([]);
            
            // Рисуем оси
            ctx.strokeStyle = COLOR.textMuted;
            ctx.lineWidth = 2;
            
            // Ось Y
            ctx.beginPath();
            ctx.moveTo(padding.left, padding.top);
            ctx.lineTo(padding.left, padding.top + graphHeight);
            ctx.stroke();
            
            // Ось X
            ctx.beginPath();
            ctx.moveTo(padding.left, padding.top + graphHeight);
            ctx.lineTo(padding.left + graphWidth, padding.top + graphHeight);
            ctx.stroke();
            
            // Рассчитываем точки для графика
            const points = [];
            for (let i = 0; i < displayStats.length; i++) {
                const x = padding.left + (i * graphWidth / (displayStats.length - 1));
                const y = valueRange === 0 ? 
                    padding.top + graphHeight / 2 : 
                    padding.top + graphHeight - ((displayStats[i][1].count - minValue) / valueRange) * graphHeight;
                
                points.push({
                    x,
                    y,
                    word: displayStats[i][0],
                    count: displayStats[i][1].count
                });
            }
            
            // Рисуем область под линией с градиентом
            const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + graphHeight);
            gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
            gradient.addColorStop(1, 'rgba(102, 126, 234, 0.1)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(points[0].x, padding.top + graphHeight);
            for (const point of points) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.lineTo(points[points.length - 1].x, padding.top + graphHeight);
            ctx.closePath();
            ctx.fill();
            
            // Рисуем линию графика
            ctx.strokeStyle = COLOR.accent;
            ctx.lineWidth = 4;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
            
            // Рисуем точки и подписи
            points.forEach((point, index) => {
                // Показываем подписи для КАЖДОЙ точки (как требовалось)
                const showLabel = true;
                
                if (showLabel) {
                    // Подпись слова (под осью X) - ГОРИЗОНТАЛЬНО (0 градусов)
                    ctx.save();
                    ctx.fillStyle = COLOR.textMuted;
                    ctx.font = '12px Arial'; // Увеличил размер шрифта
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    
                    // Обрезаем длинные слова
                    let label = point.word;
                    if (label.length > 15) {
                        label = label.substring(0, 15) + '...';
                    }
                    
                    // Рисуем текст горизонтально (0 градусов)
                    ctx.fillText(label, point.x, padding.top + graphHeight + 10);
                    ctx.restore();
                    
                    // Подпись значения (над точкой)
                    ctx.fillStyle = COLOR.textNormal;
                    ctx.font = 'bold 11px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(point.count.toString(), point.x, point.y - 8);
                }
                
                // Рисуем точку с градиентом
                const pointGradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 6);
                pointGradient.addColorStop(0, COLOR.accent);
                pointGradient.addColorStop(1, COLOR.accentHover);
                
                ctx.fillStyle = pointGradient;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
                ctx.fill();
                
                // Обводка точки
                ctx.strokeStyle = COLOR.bgPrimary;
                ctx.lineWidth = 2;
                ctx.stroke();
            });
            
                    // Chart title with improved typography
                    ctx.fillStyle = COLOR.textNormal;
                    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText('📊 ' + this.t("chartTitle"), width / 2, 20);
                    
                    // Axis labels with better typography
                    ctx.fillStyle = COLOR.textMuted;
                    ctx.font = '14px system-ui, -apple-system, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(this.t("axisX"), width / 2, height - 40);
                    
                    // Y-axis label (rotated)
                    ctx.save();
                    ctx.translate(30, height / 2);
                    ctx.rotate(-Math.PI / 2);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(this.t("axisY"), 0, 0);
                    ctx.restore();
                    
                } catch (error) {
                    console.error('Error drawing chart:', error);
                    // Fallback: show error message on canvas
                    ctx.fillStyle = '#ff0000';
                    ctx.font = '16px system-ui, -apple-system, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    // Use computed dims if available, else derive from canvas size and DPR
                    const dpr = window.devicePixelRatio || 1;
                    const safeWidth = width || Math.max(1, Math.floor(canvas.width / dpr));
                    const safeHeight = height || Math.max(1, Math.floor(canvas.height / dpr));
                    ctx.fillText('Error rendering chart', safeWidth / 2, safeHeight / 2);
                } finally {
                    drawChartRaf = 0;
                }
            });
        };

        // Функция обновления позиции прокрутки
        const updateScrollPosition = () => {
            // Use CSS pixel widths to match scrollLeft units
            const canvasWidthCss = canvas.clientWidth;
            const wrapperWidth = chartWrapper.clientWidth;
            const maxScroll = Math.max(0, canvasWidthCss - wrapperWidth);
            const newScroll = (scrollPosition / 100) * maxScroll;
            chartWrapper.scrollLeft = newScroll;
        };

        // Обработчики для масштабирования
        let lastZoomTs = 0;
        this.addEventListener(zoomIn, 'click', () => {
            const now = Date.now();
            if (now - lastZoomTs < 80) return; // throttle rapid clicks
            if (zoomLevel < maxZoom) {
                zoomLevel = Math.min(maxZoom, zoomLevel + zoomStep);
                drawChart();
                updateScrollPosition();
            }
            lastZoomTs = now;
        });

        this.addEventListener(zoomOut, 'click', () => {
            const now = Date.now();
            if (now - lastZoomTs < 80) return; // throttle rapid clicks
            if (zoomLevel > minZoom) {
                zoomLevel = Math.max(minZoom, zoomLevel - zoomStep);
                drawChart();
                updateScrollPosition();
            }
            lastZoomTs = now;
        });

        this.addEventListener(resetZoom, 'click', () => {
            zoomLevel = 1.0;
            scrollPosition = 0;
            slider.value = "0";
            drawChart();
            updateScrollPosition();
            chartWrapper.scrollLeft = 0;
        });

        // Обработчик для ползунка
        this.addEventListener(slider, 'input', (e) => {
            scrollPosition = parseInt(e.target.value);
            updateScrollPosition();
        });

        // Обработчик для прокрутки колесиком мыши
        let wheelAccum = 0;
        let wheelRaf = 0;
        const wheelHandler = (e) => {
            e.preventDefault();
            wheelAccum += e.deltaY;
            if (!wheelRaf) {
                wheelRaf = requestAnimationFrame(() => {
                    chartWrapper.scrollLeft += wheelAccum;
                    wheelAccum = 0;
                    wheelRaf = 0;
                });
            }
        };
        this.addEventListener(chartWrapper, 'wheel', wheelHandler, { passive: false });

        // Обновление ползунка при ручной прокрутке
        this.addEventListener(chartWrapper, 'scroll', () => {
            const canvasWidthCss = canvas.clientWidth;
            const wrapperWidth = chartWrapper.clientWidth;
            const maxScroll = Math.max(1, canvasWidthCss - wrapperWidth);
            const currentScroll = chartWrapper.scrollLeft;
            scrollPosition = maxScroll === 0 ? 0 : (currentScroll / maxScroll) * 100;
            slider.value = scrollPosition.toString();
        });

        // Первоначальная отрисовка
        drawChart();
        
        // Обновление при изменении размера окна
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                drawChart();
                updateScrollPosition();
            }, 250);
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(chartWrapper);
        
        // Сохраняем observer для очистки
        this.chartResizeObserver = resizeObserver;
    }

    onClose() {
        try {
            console.log("🧹 Cleaning up WordStatisticsView resources...");
            
            // Clear event listeners first
            this.clearEventListeners();
            
            // Clean up ResizeObserver
            if (this.chartResizeObserver) {
                try {
                    this.chartResizeObserver.disconnect();
                } catch (error) {
                    console.warn("Error disconnecting ResizeObserver:", error);
                }
                this.chartResizeObserver = null;
            }
            
            // Clean up chart
            if (this.chart) {
                try {
                    this.chart.destroy();
                } catch (error) {
                    console.warn("Error destroying chart:", error);
                }
                this.chart = null;
            }
            
            // Clear DOM references
            this.infoEl = null;
            this.listContainer = null;
            
            // Clear plugin reference to prevent memory leaks
            this.plugin = null;
            
            console.log("✅ WordStatisticsView cleanup completed");
            
        } catch (error) {
            console.error("Error during view cleanup:", error);
        }
    }
};

/**
 * Main Word Statistics Plugin Class
 * Provides multilingual word statistics with lemmatization support
 */
var WordStatsPlugin = class extends import_obsidian.Plugin {
    constructor() {
        super(...arguments);
        /** @type {Map<string, {baseForm: string, count: number, isUserWord?: boolean}>} All word statistics */
        this.allStats = new Map();
        /** @type {Map<string, {baseForm: string, count: number, isUserWord?: boolean}>} Filtered word statistics */
        this.filteredStats = new Map();
        /** @type {{word: string, length: number, file: string}|null} Information about the longest word found */
        this.longestWord = null;
        /** @type {number|null} Timestamp of last statistics update */
        this.lastUpdate = null;
        /** @type {Set<string>} User-defined words to exclude from statistics */
        this.userWords = new Set();
        /** @type {WordStatisticsView|null} Reference to the statistics view */
        this.view = null;
    /** @type {import("./src/languageManager").LanguageManager} Language processing manager */
        this.languageManager = new LanguageManager(this);
        // Unknown words collected for dictionary training per language
        this.unknownWords = { russian: new Map(), english: new Map(), chinese: new Map() };
        
        this.topWords = {
            russian: [
                "и", "в", "не", "на", "я", "быть", "он", "с", "что", "а",
                "по", "это", "она", "этот", "к", "но", "они", "мы", "как", "из",
                "у", "который", "то", "за", "свой", "что", "весь", "год", "от", "так",
                "о", "для", "ты", "же", "все", "тот", "мочь", "вы", "человек", "такой",
                "его", "сказать", "только", "или", "еще", "бы", "себя", "один", "как", "уже",
                "до", "время", "если", "сам", "другой", "вот", "говорить", "наш", "мой", "знать",
                "стать", "при", "дело", "жизнь", "кто", "первый", "очень", "два", "день", "её",
                "новый", "рука", "даже", "во", "со", "раз", "где", "там", "под", "можно",
                "ну", "ли", "когда", "да", "какой", "них", "через", "тем", "для", "мы",
                "перед", "без", "после", "вы", "как", "только", "почти", "ей", "им", "иногда"
            ],
            english: [
                "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
                "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
                "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
                "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
                "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
                "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
                "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
                "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
                "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
                "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
            ],
            chinese: [
                "的", "是", "在", "有", "和", "了", "不", "我", "他", "她",
                "它", "这", "那", "你", "们", "个", "人", "中", "国", "上",
                "下", "大", "小", "多", "少", "好", "坏", "对", "错", "来",
                "去", "看", "听", "说", "读", "写", "学", "习", "工", "作",
                "生", "活", "吃", "喝", "玩", "乐", "天", "地", "日", "月"
            ]
        };
    }

    /**
     * Plugin initialization with improved error handling and performance
     */
    async onload() {
        console.log("🔤 Loading Language Statistics plugin...");
        const loadStartTime = Date.now();
        
        try {
            // Load settings first (critical for operation)
            await this.loadSettings();
            console.log("✅ Settings loaded");
            // Do not initialize language tools or load caches here to keep startup fast.
            // Language tools and caches will be loaded lazily on first use (view open/refresh).

            // Register view
            this.registerView("word-stats-view", (leaf) => {
                try {
                    this.view = new WordStatisticsView(leaf, this);
                    return this.view;
                } catch (error) {
                    console.error("Error creating view:", error);
                    throw error;
                }
            });

            // Add UI elements
            this.addRibbonIcon("bar-chart", TRANSLATIONS[this.settings.language].ribbonTooltip, () => {
                this.activateView().catch(error => {
                    console.error("Error activating view:", error);
                    new import_obsidian.Notice("❌ Error opening statistics view");
                });
            });

            this.addSettingTab(new WordStatsSettingTab(this.app, this));

            // Listen to system language changes if user opted to follow
            this._systemLanguageHandler = () => {
                try {
                    if (this.settings && this.settings.followSystemLanguage) {
                        const newLang = this.detectDefaultLanguage();
                        if (["russian","english","chinese"].includes(newLang) && newLang !== this.settings.language) {
                            console.log('🌍 System language changed → applying', newLang);
                            this.settings.language = newLang;
                            this.saveSettings(true).catch(console.error);
                        }
                    }
                } catch (e) {
                    console.warn('languagechange handler error:', e);
                }
            };
            try { window.addEventListener('languagechange', this._systemLanguageHandler); } catch {}

            // Add commands
            this.addCommand({
                id: "refresh-word-stats",
                name: TRANSLATIONS[this.settings.language].cmd_refresh,
                callback: () => {
                    this.collectAllStats().catch(error => {
                        console.error("Error refreshing stats:", error);
                        new import_obsidian.Notice("❌ Error refreshing statistics");
                    });
                }
            });

            this.addCommand({
                id: "run-strict-test",
                name: TRANSLATIONS[this.settings.language].cmd_runStrictTest,
                callback: async () => {
                    try {
                        const results = await this.runStrictTest();
                        new import_obsidian.Notice(`✅ ${TRANSLATIONS[this.settings.language].test_passed}: ${results.successRate.toFixed(1)}%`);
                    } catch (error) {
                        console.error("Test failed:", error);
                        new import_obsidian.Notice(`❌ ${TRANSLATIONS[this.settings.language].test_failed}: ${error.message}`);
                    }
                }
            });

            // Export commands (filtered)
            this.addCommand({
                id: "export-stats-csv",
                name: TRANSLATIONS[this.settings.language].cmd_exportCSV,
                callback: async () => {
                    try {
                        const path = await this.exportStats('csv', 'filtered');
                        new import_obsidian.Notice(`✅ ${TRANSLATIONS[this.settings.language].exportSuccess(path)}`);
                    } catch (e) {
                        new import_obsidian.Notice(`❌ ${TRANSLATIONS[this.settings.language].exportError}`);
                        console.error('Export CSV failed:', e);
                    }
                }
            });

            this.addCommand({
                id: "export-stats-json",
                name: TRANSLATIONS[this.settings.language].cmd_exportJSON,
                callback: async () => {
                    try {
                        const path = await this.exportStats('json', 'filtered');
                        new import_obsidian.Notice(`✅ ${TRANSLATIONS[this.settings.language].exportSuccess(path)}`);
                    } catch (e) {
                        new import_obsidian.Notice(`❌ ${TRANSLATIONS[this.settings.language].exportError}`);
                        console.error('Export JSON failed:', e);
                    }
                }
            });

            // Manual Chinese segmentation session command
            this.addCommand({
                id: "open-manual-chinese-seg",
                name: TRANSLATIONS[this.settings.language].settings_manualSegmentation,
                callback: () => {
                    try {
                        this.openManualSegmentation();
                    } catch (e) {
                        console.error("Error opening manual segmentation:", e);
                        new import_obsidian.Notice("❌ Error opening manual segmentation");
                    }
                }
            });

            const loadTime = Date.now() - loadStartTime;
            console.log(`✅ Language Statistics plugin loaded successfully in ${loadTime}ms`);

        } catch (error) {
            console.error("❌ Critical error loading Language Statistics plugin:", error);
            new import_obsidian.Notice("❌ Language Statistics plugin failed to load");
            throw error; // Re-throw to prevent partial initialization
        }
    }

    getCurrentLanguageName() {
        const names = {
            russian: "russian",
            english: "english",
            chinese: "chinese"
        };
        return names[this.settings.language];
    }

    getCurrentLanguageDisplayName() {
        const names = {
            russian: "русских",
            english: "English",
            chinese: "中文"
        };
        return names[this.settings.language];
    }

    // Detect user's default language from the environment to set initial plugin language
    detectDefaultLanguage() {
        try {
            const langs = (typeof navigator !== 'undefined' && (navigator.languages || [navigator.language])) || [];
            const pick = (langs[0] || 'en').toLowerCase();
            if (pick.startsWith('ru')) return 'russian';
            if (pick.startsWith('zh') || pick.startsWith('cn')) return 'chinese';
            // default fallback
            return 'english';
        } catch (e) {
            // safest fallback
            return 'english';
        }
    }

    lemmatizeWord(word) {
        return this.languageManager.lemmatizeWord(word, this.settings.language);
    }

    extractWords(text, filePath = "") {
        return this.languageManager.extractWords(text, this.settings.language, filePath);
    }

    async collectAllStats() {
        console.log("🔄 Starting statistics collection...");
        const startTime = Date.now();
        
        try {
            // Ensure language tools for current language are ready before processing
            try {
                await this.languageManager.ensureLanguageLoaded(this.settings.language);
                this.languageManager.applyOptions?.();
            } catch (e) {
                console.warn('Proceeding without fully initialized language tools:', e);
            }
            // Initialize state
            this.allStats.clear();
            this.filteredStats.clear();
            this.longestWord = null;
            
            const files = this.app.vault.getMarkdownFiles();
            const totalFiles = files.length;
            let processedFiles = 0;
            let errorCount = 0;
            const batchSize = 5; // Process files in batches to prevent UI blocking

            if (totalFiles === 0) {
                console.log("📝 No markdown files found in vault");
                new import_obsidian.Notice("📝 No markdown files found");
                return;
            }

            console.log(`📊 Processing ${totalFiles} files...`);

            if (this.view) {
                this.view.showProgress(0, totalFiles);
            }

            // Process files in batches
            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, i + batchSize);
                
                await Promise.allSettled(batch.map(async (file) => {
                    try {
                        await this.processFile(file);
                        processedFiles++;
                    } catch (error) {
                        errorCount++;
                        console.error(`Error processing file ${file.path}:`, error);
                        
                        // Show error notice only for first few errors to avoid spam
                        if (errorCount <= 3) {
                            const t = TRANSLATIONS[this.settings.language];
                            new import_obsidian.Notice(`⚠️ ${t.errorProcessing(file.name)}: ${error.message}`);
                        }
                    }
                }));

                // Update progress and yield control
                if (this.view) {
                    this.view.updateProgress(processedFiles, totalFiles);
                }
                
                // Small delay to prevent UI blocking
                if (i % (batchSize * 5) === 0) {
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }

            // Final processing
            this.lastUpdate = Date.now();
            const processingTime = this.lastUpdate - startTime;
            
            try {
                this.updateFilteredStats();
            } catch (error) {
                console.error("Error updating filtered stats:", error);
                throw new Error(`Failed to filter statistics: ${error.message}`);
            }

            // Cache results if enabled
            if (this.settings.enableCaching) {
                try {
                    await this.saveCachedStats();
                } catch (error) {
                    console.warn("Failed to save cached stats:", error);
                    // Non-critical error, continue
                }
            }

            // Update view
            if (this.view) {
                try {
                    await this.view.drawStats();
                } catch (error) {
                    console.error("Error updating view:", error);
                    new import_obsidian.Notice("⚠️ Error updating statistics view");
                }
            }

            const successMessage = `✅ Statistics completed: ${this.allStats.size} unique words` + 
                                  `${errorCount > 0 ? ` (${errorCount} errors)` : ''} in ${processingTime}ms`;
            
            console.log(successMessage);
            new import_obsidian.Notice(`✅ ${TRANSLATIONS[this.settings.language].dict_loaded}: ${this.allStats.size} unique words`);

        } catch (error) {
            console.error("Critical error in statistics collection:", error);
            const t = TRANSLATIONS[this.settings.language];
            new import_obsidian.Notice(`❌ ${t.errorRefreshing}: ${error.message}`);
            throw error; // Re-throw for caller to handle
        }
    }

    getExcludedWordsCount() {
        const topWords = this.topWords[this.settings.language];
        return Math.min(this.settings.excludeTopWords, topWords.length) + this.userWords.size;
    }

    /**
     * Update filtered statistics by excluding top words and user-defined words
     * Optimized for large datasets
     */
    updateFilteredStats() {
        try {
            const startTime = Date.now();
            this.filteredStats.clear();

            if (this.allStats.size === 0) {
                console.log("📊 No statistics to filter");
                return;
            }

            // Build exclusion set efficiently
            const topWords = this.topWords[this.settings.language] || [];
            const excludedTopWords = topWords
                .slice(0, this.settings.excludeTopWords)
                .map((word) => this.lemmatizeWord(word))
                .filter(word => word && word.length > 0);

            const additionalExcluded = this.getAdditionalExcludedWords();
            // Optionally exclude language prepositions
            let preps: string[] = [];
            if (this.settings.ignorePrepositions && PREPOSITIONS && PREPOSITIONS[this.settings.language]) {
                preps = PREPOSITIONS[this.settings.language]
                    .map((w) => this.lemmatizeWord(w))
                    .filter((w) => w && w.length > 0);
            }
            
            // Use Set for O(1) lookups
            const allExcludedWords = new Set([
                ...excludedTopWords,
                ...this.userWords,
                ...additionalExcluded,
                ...preps
            ]);

            // Filter statistics efficiently
            let filteredCount = 0;
            for (const [word, stats] of this.allStats.entries()) {
                if (!allExcludedWords.has(word)) {
                    this.filteredStats.set(word, stats);
                    filteredCount++;
                }
            }

            const processingTime = Date.now() - startTime;
            console.log(`📊 Filtered ${filteredCount}/${this.allStats.size} words (excluded ${allExcludedWords.size} words) in ${processingTime}ms`);

        } catch (error) {
            console.error("Error updating filtered stats:", error);
            // Fallback: copy all stats if filtering fails
            this.filteredStats = new Map(this.allStats);
        }
    }

    getAdditionalExcludedWords() {
        if (!this.settings.excludedWords.trim())
            return new Set();
        return new Set(this.settings.excludedWords.split(",").map((word) => this.lemmatizeWord(word.trim())).filter((word) => word.length > 0));
    }

    addUserWord(word) {
        const lemmatizedWord = this.lemmatizeWord(word);
        this.userWords.add(lemmatizedWord);
        this.updateFilteredStats();
        this.saveUserWords().catch(console.error);
        if (this.allStats.has(lemmatizedWord)) {
            const stats = this.allStats.get(lemmatizedWord);
            if (stats) {
                stats.isUserWord = true;
            }
        }
    }

    removeUserWord(word) {
        const lemmatizedWord = this.lemmatizeWord(word);
        this.userWords.delete(lemmatizedWord);
        this.updateFilteredStats();
        this.saveUserWords().catch(console.error);
        if (this.allStats.has(lemmatizedWord)) {
            const stats = this.allStats.get(lemmatizedWord);
            if (stats) {
                delete stats.isUserWord;
            }
        }
    }

    async saveUserWords() {
        const data = await this.loadData() || {};
        data.userWords = Array.from(this.userWords);
        await this.saveData(data);
    }

    // Register a wordform not found in the base dictionary with its suggested lemma
    registerUnknownWord(language, wordform, lemma) {
        try {
            if (!language || !wordform) return;
            const map = this.unknownWords[language] || (this.unknownWords[language] = new Map());
            const key = (wordform || '').toLowerCase().trim();
            if (!key) return;
            const prev = map.get(key);
            if (prev) {
                prev.count += 1;
                // If lemma changes, keep the latest suggestion
                if (lemma && prev.lemma !== lemma) prev.lemma = lemma;
            } else {
                map.set(key, { lemma: (lemma || key), count: 1 });
            }
        } catch {}
    }

    getUnknownCount(language) {
        try { return (this.unknownWords[language]?.size) || 0; } catch { return 0; }
    }

    getUnknownEntries(language) {
        const map = this.unknownWords[language] || new Map();
        return Array.from(map.entries()).map(([word, data]) => ({ word, lemma: data.lemma, count: data.count }));
    }

    clearUnknown(language) {
        if (this.unknownWords[language]) this.unknownWords[language].clear();
    }

    async addCustomMapping(language, wordform, lemma) {
        if (!language || !wordform) return;
        const wf = (wordform || '').toLowerCase().trim();
        const lm = (lemma || '').toLowerCase().trim() || wf;
        if (!wf) return;
        if (language === 'chinese') {
            // For Chinese, store as custom phrase
            const list = Array.isArray(this.settings.chineseCustomWords) ? this.settings.chineseCustomWords : [];
            if (!list.includes(wf)) list.push(wf);
            this.settings.chineseCustomWords = list;
            await this.saveSettings(true);
            this.unknownWords.chinese?.delete(wf);
            new import_obsidian.Notice(`➕ ${wf}`);
            return;
        }
        // RU/EN: append to custom lemmas file and update in-memory map
        try {
            const id = this.manifest?.id || 'word-statistics-ru-en-cn';
            const folder = `.obsidian/plugins/${id}/dictionaries`;
            try { await this.app.vault.adapter.mkdir(folder); } catch {}
            const file = language === 'russian' ? `${folder}/custom_russian_lemmas.txt` : `${folder}/custom_english_lemmas.txt`;
            let prefix = '';
            try {
                const stat = await this.app.vault.adapter.stat(file);
                if (stat && stat.exists) prefix = '\n';
            } catch {}
            await this.app.vault.adapter.append(file, `${prefix}${wf}=${lm}`);
            // Update in-memory lemmatizer
            if (language === 'russian') this.languageManager.russianLemmatizer?.lemmas?.set(wf, lm);
            if (language === 'english') this.languageManager.englishLemmatizer?.lemmas?.set(wf, lm);
            // Remove from unknown set
            this.unknownWords[language]?.delete(wf);
            new import_obsidian.Notice(`✅ ${wf} → ${lm}`);
        } catch (e) {
            console.error('Failed to save custom mapping', e);
            new import_obsidian.Notice('❌ Failed to save custom mapping');
        }
    }

    openUnknownWords() {
        try {
            const modal = new UnknownWordsModal(this.app, this, this.settings.language);
            modal.open();
        } catch (e) {
            console.error('Failed to open unknown words modal', e);
            new import_obsidian.Notice('❌ Error opening review modal');
        }
    }

    async processFile(file) {
        try {
            const content = await this.app.vault.read(file);
            this.processContent(content, file.path);
        } catch (error) {
            console.error(`Error reading file ${file.path}:`, error);
            throw error;
        }
    }

    cleanMarkdownContent(text, filePath = "", language = "russian") {
        // Special handling for test files - extract only the poem
        if (filePath.includes("Lemmatization Test") || filePath.includes("Lemmatization_Test")) {
            return this.extractPoemContent(text, language);
        }

        let cleanedText = text;
        const processors = [
            [this.settings.ignoreFrontmatter, FRONTMATTER_RE, ""],
            [this.settings.ignoreCodeBlocks, CODE_BLOCK_RE, ""],
            [this.settings.ignoreCodeBlocks, INLINE_CODE_RE, ""],
            [this.settings.ignoreMathBlocks, MATH_BLOCK_RE, ""],
            [this.settings.ignoreMathBlocks, INLINE_MATH_RE, ""],
            [this.settings.ignoreUrls, URL_RE, ""],
            [this.settings.ignoreUrls, MARKDOWN_LINK_RE, "$1"],
            [
                this.settings.ignoreUrls,
                WIKI_LINK_RE,
                (match, link, text2) => text2 || link
            ],
            [this.settings.ignoreTags, TAG_RE1, ""],
            [this.settings.ignoreTags, TAG_RE2, ""],
            [this.settings.ignoreMarkdownSyntax, HEADERS_RE, ""],
            [this.settings.ignoreMarkdownSyntax, LIST_RE, ""],
            [this.settings.ignoreMarkdownSyntax, BOLD_RE, "$2"],
            [this.settings.ignoreMarkdownSyntax, ITALIC_RE, "$2"],
            [this.settings.ignoreMarkdownSyntax, STRIKE_RE, "$1"],
            [this.settings.ignoreMarkdownSyntax, QUOTE_RE, ""],
            [this.settings.ignoreMarkdownSyntax, HRULE_RE, ""],
            [this.settings.ignoreMarkdownSyntax, TABLE_ROW_RE, ""],
            [this.settings.ignoreMarkdownSyntax, TABLE_DIVIDER_RE, ""],
            [this.settings.ignoreMarkdownSyntax, HTML_TAG_RE, ""],
            [this.settings.ignoreMarkdownSyntax, HTML_COMMENT_RE, ""]
        ];

        processors.forEach(([shouldProcess, regex, replacement]) => {
            if (shouldProcess) {
                if (typeof replacement === "function") {
                    cleanedText = cleanedText.replace(regex, replacement);
                } else {
                    cleanedText = cleanedText.replace(regex, replacement);
                }
            }
        });
        return cleanedText;
    }

    // New function to extract only the poem from test files
    extractPoemContent(text, language) {
        // Return the full poem for the selected language
        return POEM_CONTENT[language] || "";
    }

    /**
     * Process file content and update word statistics
     * @param {string} content - The file content to process
     * @param {string} filePath - The file path for context
     */
    processContent(content, filePath) {
        try {
            if (!content || typeof content !== 'string') {
                console.warn(`Invalid content for file: ${filePath}`);
                return;
            }

            const words = this.extractWords(content, filePath);
            if (!words || words.length === 0) {
                return; // No words to process
            }

            this.accumulateWords(words, filePath);

        } catch (error) {
            console.error(`Error processing content for ${filePath}:`, error);
            throw new Error(`Content processing failed: ${error.message}`);
        }
    }

    // Deduplicated accumulator for word statistics
    accumulateWords(words, filePath) {
        let processedWords = 0;
        for (const word of words) {
            if (!word || typeof word !== 'string' || word.length === 0) continue;
            if (!this.longestWord || word.length > this.longestWord.length) {
                this.longestWord = { word, length: word.length, file: filePath };
            }
            const baseForm = word;
            const isUserWord = this.userWords.has(baseForm);
            const existing = this.allStats.get(baseForm);
            if (existing) {
                existing.count++;
                if (isUserWord && !existing.isUserWord) existing.isUserWord = true;
            } else {
                this.allStats.set(baseForm, { baseForm, count: 1, isUserWord });
            }
            processedWords++;
        }
        console.log(`📝 Processed ${processedWords} words from ${filePath}`);
    }

    getCacheData() {
        return {
            stats: Array.from(this.allStats.entries()),
            longestWord: this.longestWord,
            timestamp: this.lastUpdate || Date.now(),
            totalWords: Array.from(this.allStats.values()).reduce((sum, stat) => sum + stat.count, 0),
            uniqueWords: this.allStats.size
        };
    }

    async saveCachedStats() {
        const data = await this.loadData() || {};
        data.cache = this.getCacheData();
        data.language = this.settings.language;
        await this.saveData(data);
    }

    async loadCachedStats() {
        const data = await this.loadData();
        if (data?.cache && data.language === this.settings.language) {
            const cache = data.cache;
            this.allStats = new Map(cache.stats);
            this.longestWord = cache.longestWord;
            this.lastUpdate = cache.timestamp;
        } else {
            this.allStats.clear();
        }
        if (data?.userWords) {
            this.userWords = new Set(data.userWords);
        }
    }

    async activateView() {
        let leaf = this.app.workspace.getLeavesOfType("word-stats-view")[0];
        if (!leaf) {
            leaf = this.app.workspace.getRightLeaf(false);
            await leaf.setViewState({ type: "word-stats-view" });
        }
        this.app.workspace.revealLeaf(leaf);
    }

    /**
     * Load and validate plugin settings
     */
    async loadSettings() {
        // Load raw data first to allow migrations/cleanup before merging
        const rawData = await this.loadData();

        // Migration: remove legacy/obsolete fields from saved settings/data
        const migrateData = (data) => {
            let changed = false;
            if (!data || typeof data !== 'object') return { data, changed };

            // Known legacy keys related to removed CRF functionality or old names
            const legacySettingKeys = [
                'chineseCrfModelUrl',
                'crfModelUrl',
                'useCrf',
                'enableCrf',
                'crfEnabled',
                'chineseCrfEnabled',
                'chineseSegmentationMode' // old alias
            ];

            // Clean settings object
            if (data.settings && typeof data.settings === 'object') {
                const s = data.settings;
                // Map old value 'crf' to a supported segmentation mode
                if (s.chineseSegmentation === 'crf') {
                    s.chineseSegmentation = 'segmentit';
                    changed = true;
                }
                // Drop legacy keys
                for (const k of legacySettingKeys) {
                    if (k in s) {
                        delete s[k];
                        changed = true;
                    }
                }
            }

            // Also remove any top-level legacy fields if present
            const legacyRootKeys = [
                'crfCache',
                'crfModelUrl',
                'crfState'
            ];
            for (const k of legacyRootKeys) {
                if (k in data) {
                    delete data[k];
                    changed = true;
                }
            }

            return { data, changed };
        };

        // Apply migration and persist if something changed (without recalculation)
        let data = rawData || {};
        try {
            const { data: migrated, changed } = migrateData(data);
            data = migrated;
            if (changed) {
                await this.saveData(data);
                console.log('🧹 Settings/data migration: legacy fields removed');
            }
        } catch (e) {
            console.warn('Settings/data migration skipped due to error:', e);
        }

        const defaultSettings = {
            minWordLength: 1,
            excludedWords: "",
            ignoreMarkdownSyntax: true,
            ignoreUrls: true,
            ignoreCodeBlocks: true,
            ignoreFrontmatter: true,
            ignoreMathBlocks: true,
            ignoreTags: true,
            enableCaching: true,
            excludeTopWords: 0,
            language: "russian",
            // Chinese segmentation mode: 'segmentit' or 'dictionary'
            chineseSegmentation: "dictionary",
            // Network timeout for GitHub dictionary fetches (ms)
            networkTimeoutMs: 3000,
            // Prefer local dictionaries and never fetch online when available
            preferLocalDictionaries: true,
            // New options
            ignorePrepositions: false,
            chineseCustomWords: [],
            chineseContextPairs: [],
            russianAdvancedFallback: false,
            // Context-aware Chinese heuristics (verb-object merges etc.)
            chineseContextHeuristics: false,
            // Optionally merge VO+的 adjectival forms
            chineseAdjectivalHeuristics: false,
            // When enabled, plugin language follows system/browser language
            followSystemLanguage: true
        };

        // If no saved language is present, auto-detect from user environment
        try {
            const hasSavedLanguage = !!(data && data.settings && typeof data.settings.language === 'string');
            if (!hasSavedLanguage) {
                defaultSettings.language = this.detectDefaultLanguage();
                console.log('🌍 Auto-detected default language:', defaultSettings.language);
            }
        } catch {}

        try {
            let settingsToMerge = {};

            if (data?.settings) {
                settingsToMerge = data.settings;
            } else if (data && typeof data === 'object') {
                // Legacy format - data was stored directly
                settingsToMerge = data;
            }

            this.settings = Object.assign({}, defaultSettings, settingsToMerge);

            // Validate and sanitize settings
            this.validateSettings();

            // If opted-in, follow system language immediately (before any tool init)
            if (this.settings.followSystemLanguage) {
                const sysLang = this.detectDefaultLanguage();
                if (["russian","english","chinese"].includes(sysLang) && sysLang !== this.settings.language) {
                    this.settings.language = sysLang;
                    console.log('🌍 Follow system language enabled → applying', sysLang);
                }
            }

            console.log("✅ Settings loaded successfully");

        } catch (error) {
            console.error("Error loading settings, using defaults:", error);
            this.settings = defaultSettings;
        }
    }

    /**
     * Validate and sanitize plugin settings
     */
    validateSettings() {
        // Validate minWordLength
        if (typeof this.settings.minWordLength !== 'number' || this.settings.minWordLength < 1) {
            this.settings.minWordLength = 1;
        }
        this.settings.minWordLength = Math.max(1, Math.min(50, this.settings.minWordLength));

        // Validate excludeTopWords
        if (typeof this.settings.excludeTopWords !== 'number') {
            this.settings.excludeTopWords = 0;
        }
        this.settings.excludeTopWords = Math.max(0, Math.min(100, this.settings.excludeTopWords));

        // Validate language
        if (!['russian', 'english', 'chinese'].includes(this.settings.language)) {
            this.settings.language = 'russian';
        }

        // Validate excludedWords
        if (typeof this.settings.excludedWords !== 'string') {
            this.settings.excludedWords = '';
        }

        // Validate boolean settings
        const booleanSettings = [
            'ignoreMarkdownSyntax', 'ignoreUrls', 'ignoreCodeBlocks',
            'ignoreFrontmatter', 'ignoreMathBlocks', 'ignoreTags', 'enableCaching',
            'ignorePrepositions', 'russianAdvancedFallback', 'chineseContextHeuristics', 'chineseAdjectivalHeuristics', 'preferLocalDictionaries'
        ];

        booleanSettings.forEach(setting => {
            if (typeof this.settings[setting] !== 'boolean') {
                this.settings[setting] = true; // Default to true for most filters
            }
        });

        // followSystemLanguage defaults to false
        if (typeof this.settings.followSystemLanguage !== 'boolean') {
            this.settings.followSystemLanguage = false;
        }

        // Validate Chinese segmentation mode
        const allowedCnSeg = ['segmentit', 'dictionary'];
        if (!allowedCnSeg.includes(this.settings.chineseSegmentation)) {
            this.settings.chineseSegmentation = 'segmentit';
        }

        // Normalize chineseCustomWords to array of strings
        if (Array.isArray(this.settings.chineseCustomWords)) {
            this.settings.chineseCustomWords = this.settings.chineseCustomWords
                .filter((w) => typeof w === 'string')
                .map((w) => w.trim())
                .filter((w) => w.length > 0);
        } else if (typeof this.settings.chineseCustomWords === 'string') {
            const parts = this.settings.chineseCustomWords.split(/[,\n\r]+/);
            this.settings.chineseCustomWords = parts.map((w) => w.trim()).filter((w) => w.length > 0);
        } else {
            this.settings.chineseCustomWords = [];
        }

        // Validate network timeout (1s .. 60s)
        const minT = 1000, maxT = 60000;
        if (typeof this.settings.networkTimeoutMs !== 'number' || !isFinite(this.settings.networkTimeoutMs)) {
            this.settings.networkTimeoutMs = 3000;
        }
        this.settings.networkTimeoutMs = Math.max(minT, Math.min(maxT, Math.floor(this.settings.networkTimeoutMs)));

        // Normalize chineseContextPairs to array of strings
        if (Array.isArray(this.settings.chineseContextPairs)) {
            this.settings.chineseContextPairs = this.settings.chineseContextPairs
                .filter((w) => typeof w === 'string')
                .map((w) => w.trim())
                .filter((w) => w.length > 0);
        } else if (typeof this.settings.chineseContextPairs === 'string') {
            const parts = this.settings.chineseContextPairs.split(/[\,\n\r]+/);
            this.settings.chineseContextPairs = parts.map((w) => w.trim()).filter((w) => w.length > 0);
        } else {
            this.settings.chineseContextPairs = [];
        }

        console.log("✅ Settings validated");
    }

    async saveSettings(shouldRecalcStats = false) {
        const data = await this.loadData() || {};
        data.settings = this.settings;
        await this.saveData(data);
        if (shouldRecalcStats) {
            // Ensure the correct language tools are ready before recalculation
            try {
                await this.languageManager.ensureLanguageLoaded(this.settings.language);
            } catch (e) {
                console.warn('Language tools not fully loaded, continuing with recalculation:', e);
            }
            await this.collectAllStats();
        } else {
            this.updateFilteredStats();
            if (this.view) {
                this.view.updateStatsDisplay();
            }
        }
    }

    // Add the strict test method to the plugin
    async runStrictTest() {
        const testSystem = new EnhancedTestSystem(this);
        return await testSystem.runStrictTest();
    }

    // Export current filtered stats to CSV or JSON and save into the vault root
    async exportStats(format = "csv", scope: "filtered" | "all" = "filtered") {
        const lang = this.settings.language;
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const baseName = `Word Stats ${lang} ${timestamp}`;

        // Choose source map
        const source = scope === 'all' ? this.allStats : this.filteredStats;
        // Prepare data sorted by count desc
        const entries = Array.from(source.entries())
            .sort(([, a], [, b]) => b.count - a.count)
            .map(([word, stat], idx) => ({ rank: idx + 1, word: stat.baseForm, count: stat.count }));

        let fileName = '';
        let content = '';
        if (format === 'json') {
            fileName = `${baseName}.json`;
            content = JSON.stringify({ language: lang, generatedAt: now.toISOString(), total: entries.length, items: entries }, null, 2);
        } else {
            fileName = `${baseName}.csv`;
            const header = 'rank,word,count';
            const rows = entries.map(e => `${e.rank},"${e.word.replace(/"/g, '""')}",${e.count}`);
            content = [header, ...rows].join('\n');
        }

        // Ensure unique path and create/overwrite in vault root
        const vault = this.app.vault;
        // If file exists, append a random suffix
        let finalName = fileName;
        if (vault.getAbstractFileByPath(finalName)) {
            finalName = `${baseName}-${Math.random().toString(36).slice(2, 6)}.${format === 'json' ? 'json' : 'csv'}`;
        }
        const file = await vault.create(finalName, content);
        // Open exported file in a new leaf
        try {
            const leaf = this.app.workspace.getLeaf(true);
            await leaf.openFile(file);
        } catch (e) {
            console.warn('Failed to open exported file', e);
        }
        return file.path;
    }

    onunload() {
        if (this.settings.enableCaching) {
            this.saveCachedStats().catch(console.error);
        }
        try {
            if (this._systemLanguageHandler) {
                window.removeEventListener('languagechange', this._systemLanguageHandler);
                this._systemLanguageHandler = null;
            }
        } catch {}
        console.log("🔤 Language Statistics plugin unloaded");
    }

    openManualSegmentation() {
        const modal = new ManualChineseSegmentationModal(this.app, this);
        modal.open();
    }
};

// Settings Tab
var WordStatsSettingTab = class extends import_obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    t(key, ...params) {
        const translation = TRANSLATIONS[this.plugin.settings.language][key];
        return typeof translation === "function" ? translation(...params) : translation;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: this.t("settings_title") });

        // Language setting
        new import_obsidian.Setting(containerEl)
            .setName(this.t("settings_language"))
            .setDesc(this.t("settings_languageDesc"))
            .addDropdown((dropdown) => dropdown
                .addOption("russian", "RU Русский")
                .addOption("english", "EN English")
                .addOption("chinese", "CN 中文")
                .setValue(this.plugin.settings.language)
                .onChange(async (value) => {
                    this.plugin.settings.language = value;
                    await this.plugin.saveSettings(true);
                }));

        // Follow system language
        new import_obsidian.Setting(containerEl)
            .setName(this.t("settings_followSystemLanguage"))
            .setDesc(this.t("settings_followSystemLanguageDesc"))
            .addToggle((toggle) => toggle
                .setValue(!!this.plugin.settings.followSystemLanguage)
                .onChange(async (value) => {
                    this.plugin.settings.followSystemLanguage = !!value;
                    if (value) {
                        // Apply detected language immediately
                        const detected = this.plugin.detectDefaultLanguage();
                        if (["russian","english","chinese"].includes(detected)) {
                            this.plugin.settings.language = detected;
                        }
                        await this.plugin.saveSettings(true);
                    } else {
                        await this.plugin.saveSettings(false);
                    }
                }));

        // Minimum word length
        new import_obsidian.Setting(containerEl)
            .setName(this.t("settings_minWordLength"))
            .setDesc(this.t("settings_minWordLengthDesc"))
            .addText((text) => text
                .setPlaceholder("1")
                .setValue(String(this.plugin.settings.minWordLength))
                .onChange(async (value) => {
                    const numValue = Number(value);
                    if (!isNaN(numValue) && numValue >= 1) {
                        this.plugin.settings.minWordLength = numValue;
                        await this.plugin.saveSettings(true);
                    }
                }));

        // Exclude top words
        new import_obsidian.Setting(containerEl)
            .setName(this.t("settings_excludeTopWords"))
            .setDesc(this.t("settings_excludeTopWordsDesc", this.plugin.getCurrentLanguageName()))
            .addSlider((slider) => slider
                .setLimits(0, 100, 1)
                .setValue(this.plugin.settings.excludeTopWords)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.excludeTopWords = value;
                    await this.plugin.saveSettings(false);
                }));

        // Additional excluded words
        new import_obsidian.Setting(containerEl)
            .setName(this.t("settings_additionalExcludedWords"))
            .setDesc(this.t("settings_additionalExcludedWordsDesc"))
            .addTextArea((text) => text
                .setPlaceholder("word1,word2,word3...")
                .setValue(this.plugin.settings.excludedWords)
                .onChange(async (value) => {
                    this.plugin.settings.excludedWords = value;
                    await this.plugin.saveSettings(false);
                }));

        // Enable caching
        new import_obsidian.Setting(containerEl)
            .setName(this.t("settings_enableCaching"))
            .setDesc(this.t("settings_enableCachingDesc"))
            .addToggle((toggle) => toggle
                .setValue(this.plugin.settings.enableCaching)
                .onChange(async (value) => {
                    this.plugin.settings.enableCaching = value;
                    await this.plugin.saveSettings(false);
                }));

        // Language Methods
        containerEl.createEl("h3", { text: this.t("settings_languageMethods") });

        // Language statistics
        new import_obsidian.Setting(containerEl)
            .setName(this.t("settings_languageStats"))
            .setDesc(this.t("settings_languageStatsDesc"))
            .addButton(button => button
                .setButtonText("📊 " + this.t("settings_languageStats"))
                .onClick(() => this.showLanguageStats()));

        // Expected statistics
        new import_obsidian.Setting(containerEl)
            .setName(this.t("settings_expectedStats"))
            .setDesc(this.t("settings_expectedStatsDesc"))
            .addButton(button => button
                .setButtonText("📈 " + this.t("settings_expectedStats"))
                .onClick(() => this.showExpectedStats()));
        // Language-specific sections
        if (this.plugin.settings.language === 'chinese') {
            containerEl.createEl("h3", { text: this.t("settings_chineseSection") });

            // Chinese segmentation mode
            new import_obsidian.Setting(containerEl)
                .setName(this.t("settings_chineseSegmentation"))
                .setDesc(this.t("settings_chineseSegmentationDesc"))
                .addDropdown((dropdown) => dropdown
                    .addOption("segmentit", this.t("segmentation_segmentit"))
                    .addOption("dictionary", this.t("segmentation_dictionary"))
                    .setValue(this.plugin.settings.chineseSegmentation || 'segmentit')
                    .onChange(async (value) => {
                        this.plugin.settings.chineseSegmentation = value;
                        // Reload dictionaries/segmenter to apply the new mode
                        try {
                            await this.plugin.languageManager.reloadDictionaries();
                        } catch (e) {
                            console.warn('Failed to reload dictionaries after segmentation mode change', e);
                        }
                        await this.plugin.saveSettings(true);
                    }));

            // Manual Chinese segmentation session
            new import_obsidian.Setting(containerEl)
                .setName(this.t("settings_manualSegmentation"))
                .setDesc(this.t("settings_manualSegmentationDesc"))
                .addButton(button => button
                    .setButtonText("✂️ " + this.t("settings_manualSegmentation"))
                    .onClick(() => {
                        try {
                            this.plugin.openManualSegmentation();
                        } catch (e) {
                            console.error('Failed to open manual segmentation modal', e);
                            new import_obsidian.Notice("❌ " + this.t("errorRefreshing"));
                        }
                    }));

            // Custom Chinese words
            new import_obsidian.Setting(containerEl)
                .setName(this.t("settings_chineseCustomWords"))
                .setDesc(this.t("settings_chineseCustomWordsDesc"))
                .addTextArea((text) => text
                    .setPlaceholder(this.t("settings_chineseCustomWordsPlaceholder"))
                    .setValue(Array.isArray(this.plugin.settings.chineseCustomWords) ? this.plugin.settings.chineseCustomWords.join("\n") : "")
                    .onChange(async (value) => {
                        const parts = value.split(/[\n,\r]+/).map((s) => s.trim()).filter((s) => s.length > 0);
                        this.plugin.settings.chineseCustomWords = parts;
                        try {
                            // Reapply custom words
                            await this.plugin.languageManager.reloadDictionaries();
                        } catch (e) {
                            console.warn('Failed to reload dictionaries after custom words change', e);
                        }
                        await this.plugin.saveSettings(true);
                    }));

            // Context heuristics toggle (verb-object merges)
            new import_obsidian.Setting(containerEl)
                .setName(this.t("settings_cnContextHeuristics"))
                .setDesc(this.t("settings_cnContextHeuristicsDesc"))
                .addToggle((toggle) => toggle
                    .setValue(!!this.plugin.settings.chineseContextHeuristics)
                    .onChange(async (value) => {
                        this.plugin.settings.chineseContextHeuristics = !!value;
                        await this.plugin.saveSettings(true);
                    }));

            // Adjectival VO+的 toggle
            new import_obsidian.Setting(containerEl)
                .setName(this.t("settings_cnAdjectivalHeuristics"))
                .setDesc(this.t("settings_cnAdjectivalHeuristicsDesc"))
                .addToggle((toggle) => toggle
                    .setValue(!!this.plugin.settings.chineseAdjectivalHeuristics)
                    .onChange(async (value) => {
                        this.plugin.settings.chineseAdjectivalHeuristics = !!value;
                        await this.plugin.saveSettings(true);
                    }));

            // Custom VO pairs
            new import_obsidian.Setting(containerEl)
                .setName(this.t("settings_cnContextPairs"))
                .setDesc(this.t("settings_cnContextPairsDesc"))
                .addTextArea((text) => text
                    .setPlaceholder(this.t("settings_cnContextPairsPlaceholder"))
                    .setValue(Array.isArray(this.plugin.settings.chineseContextPairs) ? this.plugin.settings.chineseContextPairs.join("\n") : "")
                    .onChange(async (value) => {
                        const parts = value.split(/[\n,\r]+/).map((s) => s.trim()).filter((s) => s.length > 0);
                        this.plugin.settings.chineseContextPairs = parts;
                        try {
                            await this.plugin.languageManager.reloadDictionaries();
                        } catch (e) {
                            console.warn('Failed to reload dictionaries after custom pairs change', e);
                        }
                        await this.plugin.saveSettings(true);
                    }));

            // Segmentation preview panel
            containerEl.createEl("h3", { text: this.t("settings_cnPreview") });
            const previewWrap = containerEl.createEl("div", { cls: "word-stats-cn-preview" });
            const input = previewWrap.createEl("textarea", { cls: "word-stats-cn-preview-input", attr: { rows: '3', placeholder: this.t("settings_cnPreviewPlaceholder") } });
            const actions = previewWrap.createEl("div", { cls: "word-stats-cn-preview-actions" });
            const btnOn = actions.createEl("button", { cls: "word-stats-btn word-stats-btn-primary", text: this.t("settings_cnPreviewOn") });
            const btnOff = actions.createEl("button", { cls: "word-stats-btn", text: this.t("settings_cnPreviewOff") });
            const out = previewWrap.createEl("pre", { cls: "word-stats-cn-preview-output" });

            const runPreview = async (enableHeur: boolean) => {
                try { await this.plugin.languageManager.ensureLanguageLoaded('chinese'); } catch {}
                const txt = input.value || '';
                const seg = this.plugin.languageManager.chineseSegmenter.segment(txt, {
                    contextHeuristics: enableHeur,
                    adjectivalHeuristics: enableHeur && !!this.plugin.settings.chineseAdjectivalHeuristics
                });
                out.setText(Array.isArray(seg) ? seg.join(' | ') : String(seg));
            };
            btnOn.addEventListener('click', () => runPreview(true));
            btnOff.addEventListener('click', () => runPreview(false));
        }

        // Validate dictionaries
        new import_obsidian.Setting(containerEl)
            .setName(this.t("settings_validateDictionaries"))
            .setDesc(this.t("settings_validateDictionariesDesc"))
            .addButton(button => button
                .setButtonText("🔍 " + this.t("settings_validateDictionaries"))
                .onClick(async () => {
                    button.setDisabled(true);
                    button.setButtonText("⏳ " + this.t("refreshing"));
                    try {
                        const { report } = await validateDictionaries();
                        this.showValidationReport(report);
                    } catch (e) {
                        new import_obsidian.Notice("❌ " + this.t("errorRefreshing"));
                        console.error("Dictionary validation error:", e);
                    } finally {
                        button.setDisabled(false);
                        button.setButtonText("🔍 " + this.t("settings_validateDictionaries"));
                    }
                }));

        // Strict test button
        new import_obsidian.Setting(containerEl)
            .setName(this.t("settings_runStrictTest"))
            .setDesc(this.t("settings_runStrictTestDesc"))
            .addButton(button => button
                .setButtonText("🧪 " + this.t("settings_runStrictTest"))
                .onClick(async () => {
                    button.setButtonText("⏳ " + this.t("refreshing"));
                    button.setDisabled(true);
                    try {
                        const results = await this.plugin.runStrictTest();
                        this.showTestResults(results);
                        if (results.successRate >= 80) {
                            new import_obsidian.Notice(`✅ ${this.t("test_passed")}: ${results.successRate.toFixed(1)}%`);
                        } else {
                            new import_obsidian.Notice(`❌ ${this.t("test_failed")}: ${results.successRate.toFixed(1)}%`);
                        }
                    } catch (error) {
                        new import_obsidian.Notice(`💥 ${error.message}`);
                        console.error("Test failed:", error);
                    } finally {
                        button.setButtonText("🧪 " + this.t("settings_runStrictTest"));
                        button.setDisabled(false);
                    }
                }));

        // Reload dictionaries
        new import_obsidian.Setting(containerEl)
            .setName(this.t("settings_reloadDictionaries"))
            .setDesc(this.t("settings_reloadDictionariesDesc"))
            .addButton(button => button
                .setButtonText("🔄 " + this.t("settings_reloadDictionaries"))
                .onClick(async () => {
                    button.setButtonText("⏳ " + this.t("refreshing"));
                    button.setDisabled(true);
                    try {
                        await this.plugin.languageManager.reloadDictionaries();
                        new import_obsidian.Notice("✅ " + this.t("dict_reloaded"));
                    } catch (error) {
                        new import_obsidian.Notice("❌ " + this.t("errorRefreshing"));
                        console.error("Error reloading dictionaries:", error);
                    } finally {
                        button.setButtonText("🔄 " + this.t("settings_reloadDictionaries"));
                        button.setDisabled(false);
                    }
                }));

        // Content Filtering
        containerEl.createEl("h3", { text: this.t("settings_contentFiltering") });

        // Network timeout setting
        new import_obsidian.Setting(containerEl)
            .setName(this.t("settings_networkTimeout"))
            .setDesc(this.t("settings_networkTimeoutDesc"))
            .addText((text) => text
                .setPlaceholder("3000")
                .setValue(String(this.plugin.settings.networkTimeoutMs || 10000))
                .onChange(async (value) => {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                        this.plugin.settings.networkTimeoutMs = Math.max(1000, Math.min(60000, Math.floor(numValue)));
                        await this.plugin.saveSettings(false);
                    }
                }));

        const contentSettings = [
            { key: "ignoreMarkdownSyntax", name: this.t("settings_ignoreMarkdownSyntax"), desc: this.t("settings_ignoreMarkdownSyntaxDesc") },
            { key: "ignoreUrls", name: this.t("settings_ignoreUrls"), desc: this.t("settings_ignoreUrlsDesc") },
            { key: "ignoreCodeBlocks", name: this.t("settings_ignoreCodeBlocks"), desc: this.t("settings_ignoreCodeBlocksDesc") },
            { key: "ignoreFrontmatter", name: this.t("settings_ignoreFrontmatter"), desc: this.t("settings_ignoreFrontmatterDesc") },
            { key: "ignoreMathBlocks", name: this.t("settings_ignoreMathBlocks"), desc: this.t("settings_ignoreMathBlocksDesc") },
            { key: "ignoreTags", name: this.t("settings_ignoreTags"), desc: this.t("settings_ignoreTagsDesc") },
            { key: "ignorePrepositions", name: this.t("settings_ignorePrepositions"), desc: this.t("settings_ignorePrepositionsDesc") },
            { key: "preferLocalDictionaries", name: this.t("settings_preferLocalDictionaries"), desc: this.t("settings_preferLocalDictionariesDesc") }
        ];

        contentSettings.forEach((setting) => {
            new import_obsidian.Setting(containerEl)
                .setName(setting.name)
                .setDesc(setting.desc)
                .addToggle((toggle) => toggle
                    .setValue(this.plugin.settings[setting.key])
                    .onChange(async (value) => {
                        this.plugin.settings[setting.key] = value;
                        await this.plugin.saveSettings(true);
                    }));
        });

        if (this.plugin.settings.language === 'russian') {
            containerEl.createEl("h3", { text: this.t("settings_russianSection") });
            // Advanced Russian fallback option
            new import_obsidian.Setting(containerEl)
                .setName(this.t("settings_russianAdvancedFallback"))
                .setDesc(this.t("settings_russianAdvancedFallbackDesc"))
                .addToggle((toggle) => toggle
                    .setValue(!!this.plugin.settings.russianAdvancedFallback)
                    .onChange(async (value) => {
                        this.plugin.settings.russianAdvancedFallback = !!value;
                        try {
                            // Apply option immediately
                            this.plugin.languageManager.applyOptions();
                        } catch {}
                        // Recalculate stats so users immediately see effect of rules
                        await this.plugin.saveSettings(true);
                    }));
        }
    }

    async createLemmatizationTestFile() {
        const vault = this.plugin.app.vault;
        const fileName = "Lemmatization Test.md";
        
        const testContent = `# ${this.t("settings_createTestFile")}

${this.t("settings_createTestFileDesc")}

## Русское стихотворение:

${POEM_CONTENT.russian}

## English poem:

${POEM_CONTENT.english}

## 中文诗歌:

${POEM_CONTENT.chinese}

## Ожидаемая статистика Expected statistics 预期统计数据:

### Русский:
- Всего слов: ${EXPECTED_STATS.russian.totalWords}
- Уникальных слов: ${EXPECTED_STATS.russian.uniqueWords}
- Топ слова: ${EXPECTED_STATS.russian.topWords.map(w => `${w.word} (${w.count})`).join(', ')}

### English:
- Total words: ${EXPECTED_STATS.english.totalWords}
- Unique words: ${EXPECTED_STATS.english.uniqueWords}
- Top words: ${EXPECTED_STATS.english.topWords.map(w => `${w.word} (${w.count})`).join(', ')}

### 中文:
- 总单词数: ${EXPECTED_STATS.chinese.totalWords}
- 唯一单词: ${EXPECTED_STATS.chinese.uniqueWords}
- 高频单词: ${EXPECTED_STATS.chinese.topWords.map(w => `${w.word} (${w.count})`).join(', ')}

## Инструкции по тестированию:
1. Выберите разные языки в настройках плагина
2. Обновите статистику слов
3. Убедитесь, что считается только стихотворение на выбранном языке
4. Сравните результаты с ожидаемой статистикой выше
5. Проверьте, что лемматизация работает корректно

Примечание: Плагин будет считать только полное стихотворение на выбранном языке, игнорируя весь остальной контент.

## Testing instructions:
1. Select different languages ​​in the plugin settings
2. Update the word statistics
3. Ensure that only the poem in the selected language is counted
4. Compare the results with the expected statistics above
5. Verify that lemmatization is working correctly

Note: The plugin will only count the full poem in the selected language, ignoring all other content.

## 测试说明：

1. 在插件设置中选择不同的语言

2. 更新词频统计

3. 确保仅统计所​​选语言的诗歌

4. 将结果与上述预期统计数据进行比较

5. 验证词形还原功能是否正常工作

注意：插件只会统计所选语言的完整诗歌，忽略所有其他内容。
`;

        try {
            let file = vault.getAbstractFileByPath(fileName);
            if (file) {
                await vault.modify(file, testContent);
            } else {
                file = await vault.create(fileName, testContent);
            }
            
            new import_obsidian.Notice("✅ " + this.t("test_created"));
            
            // Open the test file
            const leaf = this.plugin.app.workspace.getLeaf(true);
            await leaf.openFile(file);
            
        } catch (error) {
            console.error("Error creating test file:", error);
            new import_obsidian.Notice("❌ " + this.t("errorProcessing", fileName));
        }
    }

    showLanguageStats() {
        const stats = this.plugin.languageManager.getLanguageStats();
        
        let message = this.t("settings_languageStats") + ":\n\n";
        for (const [lang, stat] of Object.entries(stats)) {
            const langName = {
                russian: "Русский",
                english: "English", 
                chinese: "中文"
            }[lang];
            
            message += `${langName}:\n`;
            message += `  ${this.t("settings_languageStats")}: ${stat.method}\n`;
            message += `  ${this.t("status")}: ${stat.status}\n`;
            message += `  ${this.t("entries")}: ${stat.entries}\n`;
            message += `  ${this.t("description")}: ${stat.description}\n`;
            if (lang === 'russian' && stat.counters) {
                message += `\n  ${this.t('settings_diagnostics')}:\n`;
                message += `    • ${this.t('diag_dictionary')}: ${stat.counters.dictionary || 0}\n`;
                message += `    • ${this.t('diag_ruVerb')}: ${stat.counters.ruVerb || 0}\n`;
                message += `    • ${this.t('diag_ruPartGer')}: ${stat.counters.ruPartGer || 0}\n`;
                message += `    • ${this.t('diag_ruAdj')}: ${stat.counters.ruAdj || 0}\n`;
                message += `    • ${this.t('diag_ruNoun')}: ${stat.counters.ruNoun || 0}\n`;
                message += `    • ${this.t('diag_ruFallback')}: ${stat.counters.ruFallback || 0}\n`;
            }
            message += `\n`;
        }
        
        const modal = new import_obsidian.Modal(this.plugin.app);
        modal.titleEl.setText(this.t("settings_languageStats"));
        
        const content = modal.contentEl;
        content.createEl("pre", { 
            text: message,
            cls: "language-stats-pre" 
        });
        
        const buttonContainer = content.createEl("div", { 
            cls: "modal-button-container" 
        });
        
        buttonContainer.createEl("button", {
            text: this.t("close"),
            cls: "mod-cta"
        }).addEventListener("click", () => modal.close());
        
        modal.open();
    }

    showExpectedStats() {
        const currentLang = this.plugin.settings.language;
        const expected = EXPECTED_STATS[currentLang];
        
        const langName = {
            russian: "Русский",
            english: "English",
            chinese: "中文"
        }[currentLang];
        
        let message = `${this.t("settings_expectedStats")} для ${langName}:\n\n`;
        message += `${this.t("totalWords")} ${expected.totalWords}\n`;
        message += `${this.t("uniqueWords")} ${expected.uniqueWords}\n\n`;
        message += `Топ ${Math.min(10, expected.topWords.length)} ${this.t("word")}:\n`;
        
        expected.topWords.slice(0, 10).forEach((word, index) => {
            message += `${index + 1}. ${word.word}: ${word.count} ${this.t("count")}\n`;
        });
        
        const modal = new import_obsidian.Modal(this.plugin.app);
        modal.titleEl.setText(this.t("settings_expectedStats"));
        
        const content = modal.contentEl;
        content.createEl("pre", { 
            text: message,
            cls: "expected-stats-pre" 
        });
        
        const buttonContainer = content.createEl("div", { 
            cls: "modal-button-container" 
        });
        
        buttonContainer.createEl("button", {
            text: this.t("close"),
            cls: "mod-cta"
        }).addEventListener("click", () => modal.close());
        
        modal.open();
    }

    showValidationReport(report) {
        const modal = new import_obsidian.Modal(this.plugin.app);
        modal.titleEl.setText(this.t("settings_validateDictionaries"));
        const content = modal.contentEl;
        content.createEl("pre", { text: report, cls: "expected-stats-pre" });
        const buttonContainer = content.createEl("div", { cls: "modal-button-container" });
        buttonContainer.createEl("button", {
            text: this.t("close"),
            cls: "mod-cta"
        }).addEventListener("click", () => modal.close());
        modal.open();
    }

    showTestResults(results) {
        const modal = new import_obsidian.Modal(this.plugin.app);
        modal.titleEl.setText("🧪 " + this.t("settings_runStrictTest"));
        
        const content = modal.contentEl;
        
        // Overall result
        const overallResult = content.createEl("div", {
            cls: `test-overall-result ${results.successRate >= 80 ? "test-passed" : "test-failed"}`
        });
        overallResult.setText(`${this.t("overall")}: ${results.successRate.toFixed(1)}% (${results.passedTests}/${results.totalTests} ${this.t("passed")})`);

        // Individual test results
        results.results.forEach(result => {
            const resultEl = content.createEl("div", { 
                cls: `test-result ${result.passed ? "test-passed" : "test-failed"}`
            });
            resultEl.setText(`${result.passed ? "✅" : "❌"} ${result.name}`);
            
            if (!result.passed && result.details) {
                const details = resultEl.createEl("div", { cls: "test-details" });
                details.createEl("div", { 
                    text: `${this.t("totalWords")}: ${this.t("expected")} ${result.details.totalWords.expected}, ${this.t("got")} ${result.details.totalWords.actual}` 
                });
                details.createEl("div", { 
                    text: `${this.t("uniqueWords")}: ${this.t("expected")} ${result.details.uniqueWords.expected}, ${this.t("got")} ${result.details.uniqueWords.actual}` 
                });
            }
            
            if (result.error) {
                const errorEl = resultEl.createEl("div", { cls: "test-error" });
                errorEl.setText(`${this.t("error")}: ${result.error}`);
            }
        });

        // Verdict
        const verdictEl = content.createEl("div", { 
            cls: "test-verdict" 
        });
        
        if (results.successRate >= 95) {
            verdictEl.setText("🎉 " + this.t("excellent_result"));
            verdictEl.addClass("test-excellent");
        } else if (results.successRate >= 80) {
            verdictEl.setText("⚠️  " + this.t("acceptable_result"));
            verdictEl.addClass("test-acceptable");
        } else {
            verdictEl.setText("🚨 " + this.t("critical_result"));
            verdictEl.addClass("test-critical");
        }

        const buttonContainer = content.createEl("div", { 
            cls: "modal-button-container" 
        });
        
        buttonContainer.createEl("button", {
            text: this.t("close"),
            cls: "mod-cta"
        }).addEventListener("click", () => modal.close());
        
        modal.open();
    }
};

// Translations are now fully centralized in src/i18n/translations.ts

var word_stats_default = WordStatsPlugin;

module.exports = word_stats_default;

// Modal for manual Chinese segmentation session
class ManualChineseSegmentationModal extends import_obsidian.Modal {
    constructor(app, plugin) {
        super(app);
        this.plugin = plugin;
        this.tokens = [];
        this.selected = new Set();
    }

    onOpen() {
        const { contentEl } = this;
        this.titleEl.setText(TRANSLATIONS[this.plugin.settings.language].settings_manualSegmentation);

        contentEl.empty();
        contentEl.addClass('manual-seg-container');

    const input = contentEl.createEl('textarea', { cls: 'manual-seg-input', attr: { rows: '6', placeholder: TRANSLATIONS[this.plugin.settings.language].ms_placeholder } });

        const controls = contentEl.createEl('div', { cls: 'manual-seg-actions' });
    const btnSegment = controls.createEl('button', { cls: 'word-stats-btn word-stats-btn-primary', text: `🔎 ${TRANSLATIONS[this.plugin.settings.language].ms_segment}` });
    const btnMerge = controls.createEl('button', { cls: 'word-stats-btn', text: `🔗 ${TRANSLATIONS[this.plugin.settings.language].ms_merge}` });
    const btnSplit = controls.createEl('button', { cls: 'word-stats-btn', text: `🔪 ${TRANSLATIONS[this.plugin.settings.language].ms_split}` });
    const btnAdd = controls.createEl('button', { cls: 'word-stats-btn', text: `➕ ${TRANSLATIONS[this.plugin.settings.language].ms_add}` });
    const btnClear = controls.createEl('button', { cls: 'word-stats-btn', text: `🧹 ${TRANSLATIONS[this.plugin.settings.language].ms_clear}` });

        const chipBox = contentEl.createEl('div', { cls: 'manual-seg-chips' });

        const renderChips = () => {
            chipBox.empty();
            this.tokens.forEach((t, idx) => {
                const chip = chipBox.createEl('span', { cls: 'manual-seg-chip', text: t });
                if (this.selected.has(idx)) chip.addClass('selected');
                chip.addEventListener('click', () => {
                    if (this.selected.has(idx)) this.selected.delete(idx); else this.selected.add(idx);
                    renderChips();
                });
            });
        };

        const doSegment = async () => {
            try {
                await this.plugin.languageManager.ensureLanguageLoaded('chinese');
            } catch {}
            const txt = input.value || '';
            const seg = this.plugin.languageManager.chineseSegmenter.segment(txt);
            this.tokens = Array.isArray(seg) ? seg : [];
            this.selected.clear();
            renderChips();
        };

        btnSegment.addEventListener('click', doSegment);
        btnClear.addEventListener('click', () => { input.value = ''; this.tokens = []; this.selected.clear(); renderChips(); });
        btnMerge.addEventListener('click', () => {
            if (this.selected.size === 0) return;
            const indices = Array.from(this.selected).sort((a,b)=>a-b);
            const first = indices[0];
            const last = indices[indices.length-1];
            // Only merge contiguous range; if gaps exist, still join by order
            const phrase = indices.map(i => this.tokens[i] || '').join('');
            // Replace range [first..last] with phrase
            const newTokens = [];
            for (let i=0;i<this.tokens.length;i++) {
                if (i === first) { newTokens.push(phrase); }
                if (i > first && i <= last) continue;
                if (i < first || i > last) newTokens.push(this.tokens[i]);
            }
            this.tokens = newTokens;
            this.selected.clear();
            // Select the merged token
            this.selected.add(first);
            renderChips();
        });
        btnSplit.addEventListener('click', () => {
            if (this.selected.size === 0) return;
            const indices = Array.from(this.selected).sort((a,b)=>a-b);
            let offset = 0;
            const newTokens = [...this.tokens];
            for (const idx of indices) {
                const realIdx = idx + offset;
                const tok = newTokens[realIdx];
                if (typeof tok === 'string' && tok.length > 1) {
                    const chars = [...tok];
                    newTokens.splice(realIdx, 1, ...chars);
                    offset += chars.length - 1;
                }
            }
            this.tokens = newTokens;
            this.selected.clear();
            renderChips();
        });
        btnAdd.addEventListener('click', async () => {
            if (this.selected.size === 0) return;
            const indices = Array.from(this.selected).sort((a,b)=>a-b);
            const phrase = indices.map(i => this.tokens[i] || '').join('');
            if (!phrase || phrase.trim().length === 0) return;
            const list = Array.isArray(this.plugin.settings.chineseCustomWords) ? this.plugin.settings.chineseCustomWords : [];
            if (!list.includes(phrase)) {
                list.push(phrase);
                this.plugin.settings.chineseCustomWords = list;
                try {
                    await this.plugin.languageManager.reloadDictionaries();
                } catch (e) {
                    console.warn('Failed to reload after adding custom word', e);
                }
                await this.plugin.saveSettings(true);
                new import_obsidian.Notice(TRANSLATIONS[this.plugin.settings.language].ms_added(phrase));
            } else {
                new import_obsidian.Notice(TRANSLATIONS[this.plugin.settings.language].ms_exists(phrase));
            }
        });

        // Auto focus
        setTimeout(() => input.focus(), 10);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// Modal to review and accept unknown words → lemmas
class UnknownWordsModal extends import_obsidian.Modal {
    constructor(app, plugin, language) {
        super(app);
        this.plugin = plugin;
        this.language = language;
        this.items = [];
    }

    onOpen() {
        const { contentEl, titleEl } = this;
        titleEl.setText(TRANSLATIONS[this.plugin.settings.language].unknown_modal_title);
        contentEl.addClass('unknown-words-container');
        this.render();
    }

    render() {
        const { contentEl } = this;
        contentEl.empty();
        const entries = this.plugin.getUnknownEntries(this.language).sort((a,b)=>b.count-a.count);

        const header = contentEl.createEl('div', { cls: 'unknown-words-header' });
        header.createEl('div', { text: TRANSLATIONS[this.plugin.settings.language].unknown_hint, cls: 'unknown-words-hint' });
        const actions = header.createEl('div', { cls: 'unknown-words-actions' });
        const approveAll = actions.createEl('button', { cls: 'word-stats-btn word-stats-btn-primary', text: TRANSLATIONS[this.plugin.settings.language].unknown_approve_all });
        const clearBtn = actions.createEl('button', { cls: 'word-stats-btn', text: TRANSLATIONS[this.plugin.settings.language].unknown_clear });

        approveAll.addEventListener('click', async () => {
            for (const it of entries) {
                const input = this.contentEl.querySelector(`#uk_${it.word}`);
                const lemma = (input && input.value) || it.lemma;
                await this.plugin.addCustomMapping(this.language, it.word, lemma);
            }
            new import_obsidian.Notice(TRANSLATIONS[this.plugin.settings.language].unknown_added_count(entries.length));
            this.close();
        });
        clearBtn.addEventListener('click', () => { this.plugin.clearUnknown(this.language); this.render(); });

        if (entries.length === 0) {
            contentEl.createEl('div', { cls: 'unknown-empty', text: TRANSLATIONS[this.plugin.settings.language].unknown_empty });
            const close = contentEl.createEl('div', { cls: 'modal-button-container' });
            close.createEl('button', { text: TRANSLATIONS[this.plugin.settings.language].close, cls: 'mod-cta' }).addEventListener('click', ()=>this.close());
            return;
        }

        const list = contentEl.createEl('div', { cls: 'unknown-words-list' });
        for (const it of entries) {
            const row = list.createEl('div', { cls: 'unknown-row' });
            row.createEl('span', { cls: 'unknown-count', text: `${it.count}×` });
            row.createEl('span', { cls: 'unknown-word', text: `${it.word} =` });
            const input = row.createEl('input', { cls: 'unknown-lemma-input' });
            input.id = `uk_${it.word}`;
            input.value = it.lemma || it.word;
            const addBtn = row.createEl('button', { cls: 'word-stats-btn', text: TRANSLATIONS[this.plugin.settings.language].unknown_add });
            addBtn.addEventListener('click', async () => {
                await this.plugin.addCustomMapping(this.language, it.word, input.value);
                row.remove();
            });
            const skipBtn = row.createEl('button', { cls: 'word-stats-btn', text: '✖' });
            skipBtn.addEventListener('click', () => { this.plugin.unknownWords[this.language]?.delete(it.word); row.remove(); });
        }

        const footer = contentEl.createEl('div', { cls: 'modal-button-container' });
        footer.createEl('button', { text: TRANSLATIONS[this.plugin.settings.language].close, cls: 'mod-cta' }).addEventListener('click', ()=>this.close());
    }
}