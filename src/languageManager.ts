// @ts-nocheck
import { Lemmatizer } from "./lemmatizer";
import { ChineseSegmenter } from "./chineseSegmenter";
import { filterAndLemmatize } from "./utils/text";

/**
 * Language Manager - Coordinates lemmatizers and word extraction for different languages
 */
export class LanguageManager {
    /**
     * Initialize language manager with plugin reference
     * @param {any} plugin - The main plugin instance
     */
    constructor(plugin) {
        /** @type {any} Reference to the main plugin */
        this.plugin = plugin;
        /** @type {Lemmatizer} Russian language lemmatizer */
        this.russianLemmatizer = new Lemmatizer();
        /** @type {Lemmatizer} English language lemmatizer */
        this.englishLemmatizer = new Lemmatizer();
    /** @type {ChineseSegmenter} Chinese text segmenter */
    this.chineseSegmenter = new ChineseSegmenter(this.plugin);
        /** @type {boolean} Whether all language tools have been initialized */
        this.initialized = false;
    }

    /**
     * Initialize language managers with lazy loading optimization
     * Only loads the currently selected language immediately, others on-demand
     */
    async initialize() {
        if (this.initialized) return;
        
        console.log("🚀 Initializing language managers...");
        const startTime = Date.now();
        
        try {
            const currentLanguage = this.plugin.settings.language;
            
            // Load current language immediately
            switch (currentLanguage) {
                case 'russian':
                    await this.russianLemmatizer.loadDictionary('russian');
                    break;
                case 'english':
                    await this.englishLemmatizer.loadDictionary('english');
                    break;
                case 'chinese':
                    await this.chineseSegmenter.loadDictionary('chinese');
                    break;
                default:
                    console.warn(`Unknown language: ${currentLanguage}, loading Russian as default`);
                    await this.russianLemmatizer.loadDictionary('russian');
                    break;
            }
            
            // Load other dictionaries in background after a delay
            setTimeout(async () => {
                try {
                    const backgroundTasks = [];
                    
                    if (currentLanguage !== 'russian' && !this.russianLemmatizer.loaded) {
                        backgroundTasks.push(this.russianLemmatizer.loadDictionary('russian'));
                    }
                    if (currentLanguage !== 'english' && !this.englishLemmatizer.loaded) {
                        backgroundTasks.push(this.englishLemmatizer.loadDictionary('english'));
                    }
                    if (currentLanguage !== 'chinese' && !this.chineseSegmenter.loaded) {
                        backgroundTasks.push(this.chineseSegmenter.loadDictionary('chinese'));
                    }
                    
                    if (backgroundTasks.length > 0) {
                        console.log("📦 Loading remaining dictionaries in background...");
                        await Promise.allSettled(backgroundTasks);
                        console.log("✅ Background dictionary loading completed");
                    }
                } catch (error) {
                    console.warn("Some background dictionaries failed to load:", error);
                }
            }, 2000); // 2 second delay for background loading
            
            this.initialized = true;
            const initTime = Date.now() - startTime;
            console.log(`✅ Language manager initialized (${currentLanguage}) in ${initTime}ms`);
            
        } catch (error) {
            console.error("Failed to initialize language manager:", error);
            this.initialized = false;
            throw error;
        }
    }

    /**
     * Ensure a specific language is loaded
     * @param {string} language - Language to ensure is loaded
     */
    async ensureLanguageLoaded(language) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        switch (language) {
            case 'russian':
                if (!this.russianLemmatizer.loaded) {
                    await this.russianLemmatizer.loadDictionary('russian');
                }
                break;
            case 'english':
                if (!this.englishLemmatizer.loaded) {
                    await this.englishLemmatizer.loadDictionary('english');
                }
                break;
            case 'chinese':
                if (!this.chineseSegmenter.loaded) {
                    await this.chineseSegmenter.loadDictionary('chinese');
                }
                break;
        }
    }

    /**
     * Lemmatize a word using the specified language
     * @param {string} word - Word to lemmatize
     * @param {string} language - Language to use for lemmatization
     * @returns {string} Lemmatized word
     */
    lemmatizeWord(word, language) {
        if (!this.initialized) return word.toLowerCase();

        switch (language) {
            case 'russian':
                return this.russianLemmatizer.lemmatize(word);
            case 'english':
                return this.englishLemmatizer.lemmatize(word);
            case 'chinese':
                return this.chineseSegmenter.lemmatize(word);
            default:
                return word.toLowerCase();
        }
    }

    extractWords(text, language, filePath = "") {
        try {
            if (!text || typeof text !== 'string') {
                return [];
            }
            
            const cleanedText = this.plugin.cleanMarkdownContent(text, filePath, language);
            if (!cleanedText || cleanedText.trim().length === 0) {
                return [];
            }
            
            const minLength = Math.max(1, this.plugin.settings.minWordLength);
            const results = [];
            
            if (language === 'chinese') {
                const segmented = this.chineseSegmenter.segment(cleanedText);
                return filterAndLemmatize(segmented, minLength, (w) => this.lemmatizeWord(w, language));
            } else if (language === 'russian') {
                const words = cleanedText.match(/[\u0400-\u04FF]+/g) || [];
                return filterAndLemmatize(words, minLength, (w) => this.lemmatizeWord(w, language));
            } else if (language === 'english') {
                const words = cleanedText.match(/\b[a-zA-Z]+\b/g) || [];
                return filterAndLemmatize(words, minLength, (w) => this.lemmatizeWord(w, language));
            } else {
                const words = cleanedText.match(/\p{L}+/gu) || [];
                return filterAndLemmatize(words, minLength, (w) => this.lemmatizeWord(w, language));
            }
            
        } catch (error) {
            console.error(`Error extracting words for ${language}:`, error);
            return [];
        }
    }

    getLanguageStats() {
        return {
            russian: {
                method: "Лемматизация по словарю",
                status: this.russianLemmatizer.loaded ? "✅ Загружен" : "❌ Не загружен",
                description: "Преобразует словоформы в словарные леммы",
                entries: this.russianLemmatizer.getStats().entries
            },
            english: {
                method: "Dictionary Lemmatization", 
                status: this.englishLemmatizer.loaded ? "✅ Loaded" : "❌ Not loaded",
                description: "Converts word forms to dictionary lemmas",
                entries: this.englishLemmatizer.getStats().entries
            },
            chinese: {
                method: "Сегментация слов + лемматизация",
                status: this.chineseSegmenter.loaded ? "✅ Загружен" : "❌ Не загружен", 
                description: "Сегментирует текст и использует слова как леммы",
                entries: this.chineseSegmenter.getStats().entries
            }
        };
    }

    async reloadDictionaries() {
        console.log("🔄 Reloading dictionaries...");
        this.initialized = false;
        await this.initialize();
    }
}
