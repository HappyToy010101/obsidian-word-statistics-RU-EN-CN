// @ts-nocheck
import { DICTIONARY_URLS, DEFAULT_DICTIONARIES } from "./constants";
import { Segment, useDefault } from 'segmentit';

/**
 * Chinese text segmenter for breaking Chinese text into words
 * Uses maximum matching algorithm with dictionary lookup
 */
export class ChineseSegmenter {
    /** Initialize a new Chinese segmenter */
    constructor(plugin?: any) {
        this.plugin = plugin || null;
        /** @type {Set<string>} Set of known Chinese words */
        this.words = new Set();
        /** @type {boolean} Whether the word dictionary has been loaded */
        this.loaded = false;
        /** @type {number} Max word length observed in dictionary */
        this.maxWordLength = 4;
        /** @type {any} Segmentit instance (if available) */
        try {
            // Initialize segmentit with default dictionaries
            this.segmentit = useDefault(new Segment());
        } catch (e) {
            this.segmentit = null;
        }
    }

    async loadDictionary(language) {
        try {
            console.log(`📥 Loading ${language} word list...`);
            
            // If segmentit is available, it's already initialized with its own dictionaries.
            const preferSegmentit = this.plugin?.settings?.chineseSegmentation !== 'dictionary';
            if (this.segmentit && preferSegmentit) {
                console.log('✅ Using segmentit for Chinese segmentation');
                this.loaded = true;
                return;
            }

            // Dictionary mode: prefer embedded default dictionary for deterministic counts
            if (this.plugin?.settings?.chineseSegmentation === 'dictionary') {
                this.parseDictionary(DEFAULT_DICTIONARIES[language]);
                console.log(`✅ ${language} default word list loaded (dictionary mode): ${this.words.size} entries`);
                this.loaded = true;
                return;
            }

            // Otherwise, try GitHub dictionary, then fallback to embedded
            try {
                const response = await fetch(DICTIONARY_URLS[language]);
                if (response.ok) {
                    const content = await response.text();
                    this.parseDictionary(content);
                    console.log(`✅ ${language} word list loaded from GitHub: ${this.words.size} entries`);
                    this.loaded = true;
                    return;
                }
            } catch (error) {
                console.log(`⚠️ Could not load ${language} word list from GitHub, using default`);
            }

            this.parseDictionary(DEFAULT_DICTIONARIES[language]);
            console.log(`✅ ${language} default word list loaded: ${this.words.size} entries`);
            this.loaded = true;
            
        } catch (error) {
            console.error(`❌ Error loading ${language} word list:`, error);
            this.loaded = false;
        }
    }

    parseDictionary(content) {
        this.words.clear();
        this.maxWordLength = 1;
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            // Skip comments and empty lines
            if (!trimmed || trimmed.startsWith('#')) continue;
            // For Chinese, just add the word directly
            this.words.add(trimmed);
            if (trimmed.length > this.maxWordLength) this.maxWordLength = trimmed.length;
        }
        // Keep a sane cap to avoid excessive scans
        this.maxWordLength = Math.max(1, Math.min(this.maxWordLength, 8));
    }

    isChineseChar(char) {
        const code = char.charCodeAt(0);
        return (code >= 0x4E00 && code <= 0x9FFF) || 
               (code >= 0x3400 && code <= 0x4DBF) ||
               (code >= 0xF900 && code <= 0xFAFF);
    }

    segment(text) {
        if (!this.loaded) return [text];
        if (!text || typeof text !== 'string') return [];

        // Prefer segmentit when available for linguistically robust segmentation
        if (this.segmentit) {
            try {
                const tokens = this.segmentit.doSegment(text, { simple: true });
                // Keep tokens that contain at least one Han character, drop empty/whitespace/punctuation
                const han = /\p{Script=Han}/u;
                const filtered = (tokens || [])
                    .filter(t => typeof t === 'string' && t.trim().length > 0 && han.test(t))
                    .map(t => t.trim());
                return this.normalizeDeTokens(this.mergePossessives(filtered));
            } catch (e) {
                console.warn('segmentit failed, falling back to internal matcher:', e);
                // fall through to fallback
            }
        }

        // Fallback: internal maximum matching with our small dictionary
        const words = [];
        let i = 0;
        const maxWordLength = this.maxWordLength || 4;
        while (i < text.length) {
            const char = text[i];
            if (!this.isChineseChar(char)) {
                i++;
                continue;
            }
            let found = false;
            let foundWord = null;
            for (let len = Math.min(maxWordLength, text.length - i); len >= 1; len--) {
                const candidate = text.substring(i, i + len);
                if (this.words.has(candidate)) {
                    foundWord = candidate;
                    found = true;
                    break;
                }
            }
            if (foundWord) {
                words.push(foundWord);
                i += foundWord.length;
            } else {
                words.push(char);
                i++;
            }
        }
        return this.normalizeDeTokens(this.mergePossessives(words));
    }

    /**
     * Merge possessive constructions like 你 + 的 => 你的, 我 + 的 => 我的, 我们 + 的 => 我们的, etc.
     * This aligns counts with common expectations where such forms are treated as single tokens.
     */
    mergePossessives(tokens) {
        if (!Array.isArray(tokens) || tokens.length === 0) return tokens || [];
        const pronouns = new Set([
            '我','你','他','她','它',
            '我们','你们','他们','她们','它们',
            '自己'
        ]);
        const merged = [];
        for (let i = 0; i < tokens.length; i++) {
            const cur = tokens[i];
            const next = tokens[i + 1];
            if (next === '的' && pronouns.has(cur)) {
                merged.push(cur + '的');
                i++; // skip next
                continue;
            }
            merged.push(cur);
        }
        return merged;
    }

    /**
     * Normalize tokens around "的" for dictionary mode expectations:
     * - Split any multi-char token ending with 的 into [prefix, '的'] (except possessive forms like 你的/我的/...)
     * - If we have pattern [X, Y, '的'] where X and Y are single Han chars, merge X+Y to form a common disyllabic adjective (e.g., 响+亮+的 -> 响亮, 的)
     */
    normalizeDeTokens(tokens) {
        if (!Array.isArray(tokens) || tokens.length === 0) return tokens || [];
        const possessives = new Set([
            '我的','你的','他的','她的','它的',
            '我们的','你们的','他们的','她们的','它们的','自己的'
        ]);

        const isHanChar = (s) => typeof s === 'string' && s.length === 1 && /\p{Script=Han}/u.test(s);

        // First pass: split X的 into X + 的 (except possessives)
        const split = [];
        for (const t of tokens) {
            if (typeof t === 'string' && t.length > 1 && t.endsWith('的') && !possessives.has(t)) {
                const base = t.slice(0, -1);
                if (base.length > 0) {
                    split.push(base, '的');
                    continue;
                }
            }
            split.push(t);
        }

        // Second pass: merge [X, Y, '的'] when X and Y are single Han chars -> [XY, '的']
        const mergedTmp = [];
        for (let i = 0; i < split.length; i++) {
            const a = split[i];
            const b = split[i + 1];
            const c = split[i + 2];
            if (isHanChar(a) && isHanChar(b) && c === '的') {
                mergedTmp.push(a + b);
                mergedTmp.push('的');
                i += 2;
                continue;
            }
            mergedTmp.push(a);
        }

        // Third pass: merge any adjacent single-Han [X, Y] if XY exists in dictionary
        const merged = [];
        for (let i = 0; i < mergedTmp.length; i++) {
            const a = mergedTmp[i];
            const b = mergedTmp[i + 1];
            if (isHanChar(a) && isHanChar(b)) {
                const combined = a + b;
                if (this.words && this.words.has(combined)) {
                    merged.push(combined);
                    i += 1; // consume b
                    continue;
                }
            }
            merged.push(a);
        }
        return merged;
    }

    lemmatize(word) {
        // For Chinese, the word itself is the lemma since there's no morphological variation
        return word;
    }

    getStats() {
        return {
            loaded: this.loaded,
            entries: this.words.size
        };
    }
}
