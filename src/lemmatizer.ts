// @ts-nocheck
import { DICTIONARY_URLS, DEFAULT_DICTIONARIES } from "./constants";

/**
 * Lemmatizer class for word form reduction to base forms
 * Supports loading dictionaries from GitHub or using fallback defaults
 */
export class Lemmatizer {
    /** Initialize a new Lemmatizer instance */
    constructor() {
        /** @type {Map<string, string>} Map of word forms to lemmas */
        this.lemmas = new Map();
        /** @type {boolean} Whether the dictionary has been successfully loaded */
        this.loaded = false;
    }

    async loadDictionary(language) {
        try {
            console.log(`📥 Loading ${language} dictionary...`);
            
            if (!language || !DICTIONARY_URLS[language]) {
                throw new Error(`Invalid language: ${language}`);
            }
            
            // Try to load from GitHub first with timeout
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                
                const response = await fetch(DICTIONARY_URLS[language], {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const content = await response.text();
                    if (!content || content.trim().length === 0) {
                        throw new Error(`Empty dictionary content for ${language}`);
                    }
                    this.parseDictionary(content);
                    console.log(`✅ ${language} dictionary loaded from GitHub: ${this.lemmas.size} entries`);
                    this.loaded = true;
                    return;
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log(`⏰ Dictionary load timeout for ${language}, using default`);
                } else {
                    console.log(`⚠️ Could not load ${language} dictionary from GitHub (${error.message}), using default`);
                }
            }

            // Fallback to default dictionary
            if (!DEFAULT_DICTIONARIES[language]) {
                throw new Error(`No default dictionary available for ${language}`);
            }
            
            this.parseDictionary(DEFAULT_DICTIONARIES[language]);
            console.log(`✅ ${language} default dictionary loaded: ${this.lemmas.size} entries`);
            this.loaded = true;
            
        } catch (error) {
            console.error(`❌ Critical error loading ${language} dictionary:`, error);
            this.loaded = false;
            this.lemmas.clear();
            throw new Error(`Failed to load ${language} dictionary: ${error.message}`);
        }
    }

    parseDictionary(content) {
        try {
            this.lemmas.clear();
            
            if (!content || typeof content !== 'string') {
                throw new Error('Invalid dictionary content');
            }
            
            const lines = content.split('\n');
            let parsedEntries = 0;
            let skippedLines = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                
                // Skip comments and empty lines
                if (!trimmed || trimmed.startsWith('#')) {
                    skippedLines++;
                    continue;
                }
                
                try {
                    // Parse "wordform=lemma" format
                    const [wordform, lemma] = trimmed.split('=');
                    if (wordform && lemma) {
                        const cleanWordform = wordform.trim().toLowerCase();
                        const cleanLemma = lemma.trim().toLowerCase();
                        
                        if (cleanWordform.length > 0 && cleanLemma.length > 0) {
                            this.lemmas.set(cleanWordform, cleanLemma);
                            parsedEntries++;
                        }
                    } else if (wordform && !lemma) {
                        // For Chinese - just add the word as is
                        const cleanWordform = wordform.trim();
                        if (cleanWordform.length > 0) {
                            this.lemmas.set(cleanWordform, cleanWordform);
                            parsedEntries++;
                        }
                    }
                } catch (lineError) {
                    console.warn(`Error parsing dictionary line ${i + 1}: "${line}" - ${lineError.message}`);
                    skippedLines++;
                }
            }
            
            if (parsedEntries === 0) {
                throw new Error('No valid dictionary entries parsed');
            }
            
            console.log(`Dictionary parsed: ${parsedEntries} entries, ${skippedLines} lines skipped`);
            
        } catch (error) {
            console.error('Error parsing dictionary:', error);
            this.lemmas.clear();
            throw new Error(`Dictionary parsing failed: ${error.message}`);
        }
    }

    /**
     * Convert a word form to its lemma (base form)
     * @param {string} word - The word to lemmatize
     * @returns {string} The lemmatized word or original word if no lemma found
     */
    lemmatize(word) {
        if (!this.loaded || !word || typeof word !== 'string') {
            return word ? word.toLowerCase() : '';
        }
        
        const cleanWord = word.toLowerCase().trim();
        
        // Exact match
        if (this.lemmas.has(cleanWord)) {
            return this.lemmas.get(cleanWord);
        }
        
        // If no lemma found, return original word in lowercase
        return cleanWord;
    }

    getStats() {
        return {
            loaded: this.loaded,
            entries: this.lemmas.size
        };
    }
}
