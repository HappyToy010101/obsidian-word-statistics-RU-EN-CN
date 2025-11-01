// @ts-nocheck
import { DICTIONARY_URLS, DEFAULT_DICTIONARIES } from "./constants";
import { Segment, useDefault } from 'segmentit';

// Simple in-memory cache of dictionary text for faster reloads
const CN_DICT_TEXT_CACHE: Map<string, string> = new Map();

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
        /** @type {Set<string>} User-provided custom words/phrases */
        this.customWords = new Set();
        /** @type {Set<string>} Whitelist of context VO pairs to merge */
        this.contextPairs = new Set();
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
                // Load context VO pairs (builtin + custom)
                this.loadContextPairs();
                // Apply custom words so mergeCustomPhrases works in segmentit mode
                this.applyCustomWords();
                return;
            }

            // Dictionary mode: prefer LOCAL dictionary for deterministic counts
            if (this.plugin?.settings?.chineseSegmentation === 'dictionary') {
                // Prefer local file if present
                const local = await this.readLocalDictionary(language);
                if (local) {
                    this.parseDictionary(local);
                    CN_DICT_TEXT_CACHE.set(language, local);
                    console.log(`✅ ${language} dictionary loaded from LOCAL plugin folder (dictionary mode)`);
                } else {
                    // Fallback to cache, then embedded default
                    const cached = CN_DICT_TEXT_CACHE.get(language);
                    if (cached) {
                        this.parseDictionary(cached);
                        console.log(`⚡ Used cached ${language} dictionary (dictionary mode)`);
                    } else {
                        const content = DEFAULT_DICTIONARIES[language];
                        this.parseDictionary(content);
                        CN_DICT_TEXT_CACHE.set(language, content);
                        console.log(`✅ ${language} default word list loaded (dictionary mode)`);
                    }
                }
                console.log(`✅ ${language} word list ready (dictionary mode): ${this.words.size} entries`);
                this.loaded = true;
                this.loadContextPairs();
                // Apply custom words from settings
                this.applyCustomWords();
                return;
            }

            // No CRF mode; continue

            // Otherwise, try local file, then GitHub dictionary, then fallback to embedded
            const preferLocalOnly = !!this.plugin?.settings?.preferLocalDictionaries;
            try {
                // Try cache first
                const cached = CN_DICT_TEXT_CACHE.get(language);
                if (cached) {
                    this.parseDictionary(cached);
                    console.log(`⚡ Used cached ${language} dictionary`);
                    this.loaded = true;
                    return;
                }
                const local = await this.readLocalDictionary(language);
                if (local) {
                    this.parseDictionary(local);
                    CN_DICT_TEXT_CACHE.set(language, local);
                    console.log(`✅ ${language} word list loaded from local plugin folder: ${this.words.size} entries`);
                    this.loaded = true;
                    this.loadContextPairs();
                    return;
                }
                if (!preferLocalOnly) {
                    // Apply configurable network timeout for GitHub fetch
                    const controller = new AbortController();
                    const timeoutMs = Math.max(1000, Math.min(60000, (this.plugin?.settings?.networkTimeoutMs ?? 10000)));
                    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
                    const response = await fetch(DICTIONARY_URLS[language], { signal: controller.signal });
                    clearTimeout(timeoutId);
                    if (response.ok) {
                        const content = await response.text();
                        this.parseDictionary(content);
                        CN_DICT_TEXT_CACHE.set(language, content);
                        console.log(`✅ ${language} word list loaded from GitHub: ${this.words.size} entries`);
                        // Persist fetched dictionary locally for offline reuse
                        try { await this.saveLocalDictionary(language, content); } catch {}
                        this.loaded = true;
                        this.loadContextPairs();
                        return;
                    }
                } else {
                    console.log(`🌐 Online fetch disabled by settings, using local/default for ${language}`);
                }
            } catch (error) {
                if (error?.name === 'AbortError') {
                    console.log(`⏰ Word list load timeout for ${language}, using default`);
                } else {
                    console.log(`⚠️ Could not load ${language} word list from GitHub (${error?.message || error}), using default`);
                }
            }

            this.parseDictionary(DEFAULT_DICTIONARIES[language]);
            CN_DICT_TEXT_CACHE.set(language, DEFAULT_DICTIONARIES[language]);
            console.log(`✅ ${language} default word list loaded: ${this.words.size} entries`);
            this.loaded = true;
            this.loadContextPairs();
            this.applyCustomWords();
            
        } catch (error) {
            console.error(`❌ Error loading ${language} word list:`, error);
            this.loaded = false;
        }
    }

    /** Try read dictionary from the local plugin folder inside the vault */
    async readLocalDictionary(language: string): Promise<string|null> {
        try {
            if (!this.plugin || !this.plugin.app?.vault?.adapter) return null;
            const id = this.plugin.manifest?.id || 'word-statistics-ru-en-cn';
            const map: Record<string,string> = {
                chinese: `.obsidian/plugins/${id}/dictionaries/chinese_words.txt`,
                english: `.obsidian/plugins/${id}/dictionaries/english_lemmas.txt`,
                russian: `.obsidian/plugins/${id}/dictionaries/russian_lemmas.txt`,
            };
            const path = map[language];
            if (!path) return null;
            // Try direct read first; some adapters may not support stat reliably
            try {
                const text = await this.plugin.app.vault.adapter.read(path);
                if (typeof text === 'string' && text.trim().length > 0) {
                    console.log(`📚 Found LOCAL ${language} word list at ${path} (${text.length} chars)`);
                    return text;
                }
            } catch {
                // Ignore and try stat+read fallback
            }
            try {
                const stat = await this.plugin.app.vault.adapter.stat(path);
                if (!stat || !stat.exists) return null;
                const text = await this.plugin.app.vault.adapter.read(path);
                return (typeof text === 'string' && text.trim().length > 0) ? text : null;
            } catch { return null; }
        } catch (e) { return null; }
    }

    /** Save dictionary text locally under plugin folder for the given language */
    async saveLocalDictionary(language: string, content: string): Promise<void> {
        try {
            if (!this.plugin || !this.plugin.app?.vault?.adapter) return;
            const id = this.plugin.manifest?.id || 'word-statistics-ru-en-cn';
            const folder = `.obsidian/plugins/${id}/dictionaries`;
            try { await this.plugin.app.vault.adapter.mkdir(folder); } catch {}
            const map: Record<string,string> = {
                chinese: `${folder}/chinese_words.txt`,
                english: `${folder}/english_lemmas.txt`,
                russian: `${folder}/russian_lemmas.txt`,
            };
            const path = map[language];
            if (!path) return;
            await this.plugin.app.vault.adapter.write(path, content);
            console.log(`💾 Saved ${language} word list locally for offline use`);
        } catch (e) {
            // ignore
        }
    }

    /** Parse a newline-delimited dictionary text into the in-memory set */
    parseDictionary(content: string): void {
        try {
            this.words = new Set();
            this.maxWordLength = 1;
            if (typeof content !== 'string' || content.length === 0) return;
            const lines = content.split(/\r?\n/);
            for (const line of lines) {
                const trimmed = (line || '').trim();
                if (!trimmed || trimmed.startsWith('#')) continue;
                // For Chinese, we only keep entries that include Han characters
                if (!/\p{Script=Han}/u.test(trimmed)) continue;
                this.words.add(trimmed);
                if (trimmed.length > this.maxWordLength) this.maxWordLength = trimmed.length;
            }
            // Keep a sane cap to avoid excessive scans
            this.maxWordLength = Math.max(1, Math.min(this.maxWordLength, 16));
        } catch (e) {
            // keep whatever was parsed
        }
    }

    /** Quick helper: does the char look like a CJK Han character? */
    isChineseChar(char: string): boolean {
        try {
            return typeof char === 'string' && char.length > 0 && /\p{Script=Han}/u.test(char[0]);
        } catch {
            return false;
        }
    }

    segment(text, opts?: { contextHeuristics?: boolean, adjectivalHeuristics?: boolean }) {
        if (!this.loaded) return [text];
        if (!text || typeof text !== 'string') return [];

        // Prefer segmentit when available ONLY if selected in settings (not in 'dictionary' mode)
        const useSegmentit = !!this.segmentit && (this.plugin?.settings?.chineseSegmentation !== 'dictionary');
        if (useSegmentit) {
            try {
                const tokens = this.segmentit.doSegment(text, { simple: true });
                // Keep tokens that contain at least one Han character, drop empty/whitespace/punctuation
                const han = /\p{Script=Han}/u;
                let filtered = (tokens || [])
                    .filter(t => typeof t === 'string' && t.trim().length > 0 && han.test(t))
                    .map(t => t.trim());
                // Merge user custom phrases on top of segmentit result
                filtered = this.mergeCustomPhrases(filtered);
                // Context-aware merges: pronoun + 们; common verb-object pairs (setting-gated); then possessives
                filtered = this.mergePronounPlurals(filtered);
                filtered = this.mergeContextPairs(filtered, opts);
                filtered = this.mergePossessives(filtered);
                return this.normalizeDeTokens(filtered, opts);
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
                if (this.words.has(candidate) || this.customWords.has(candidate)) {
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
        // Apply context-aware merges for fallback path as well
        let out = this.mergeCustomPhrases(words);
        out = this.mergePronounPlurals(out);
        out = this.mergeContextPairs(out, opts);
        out = this.mergePossessives(out);
        return this.normalizeDeTokens(out, opts);
    }

    // No CRF loader required

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
     * Merge common verb-object collocations when enabled via setting.
     * This is a conservative whitelist to avoid over-merging.
     */
    mergeContextPairs(tokens: string[], opts?: { contextHeuristics?: boolean, adjectivalHeuristics?: boolean }): string[] {
        try {
            const on = !!(opts?.contextHeuristics ?? this.plugin?.settings?.chineseContextHeuristics);
            if (!on) return tokens || [];
        } catch { return tokens || []; }
        if (!Array.isArray(tokens) || tokens.length === 0) return tokens || [];

        const MERGE_SET = this.getContextPairs();
        const isHan = (s: string) => typeof s === 'string' && /\p{Script=Han}/u.test(s);
        const result: string[] = [];
        for (let i = 0; i < tokens.length; i++) {
            // Try to match up to 4 consecutive Han tokens to allow 3-4 char pairs like 打电话/写作业
            let matched: string | null = null;
            let consumed = 0;
            if (isHan(tokens[i])) {
                let acc = '' + tokens[i];
                for (let len = 2; len <= 4 && (i + len - 1) < tokens.length; len++) {
                    const tNext = tokens[i + len - 1];
                    if (!isHan(tNext)) break;
                    acc = len === 2 ? ('' + tokens[i] + tNext) : (acc + tNext);
                    if (MERGE_SET.has(acc)) {
                        matched = acc;
                        consumed = len - 1;
                    }
                }
            }
            if (matched) {
                result.push(matched);
                const adjOn = !!(opts?.adjectivalHeuristics ?? this.plugin?.settings?.chineseAdjectivalHeuristics);
                if (adjOn && tokens[i + consumed + 1] === '的') {
                    result[result.length - 1] = matched + '的';
                    consumed += 1;
                }
                i += consumed;
            } else {
                result.push(tokens[i]);
            }
        }
        return result;
    }

    /**
     * Merge plural pronouns in context: [我|你|他|她|它, '们'] -> ['我们'|...] and also keeps any trailing '的' to be handled by mergePossessives.
     * This ensures sequences like 我 们 的 become 我们 的 (and later 我们的).
     */
    mergePronounPlurals(tokens: string[]): string[] {
        if (!Array.isArray(tokens) || tokens.length === 0) return tokens || [];
        const bases = new Set(['我','你','他','她','它']);
        const result: string[] = [];
        for (let i = 0; i < tokens.length; i++) {
            const a = tokens[i];
            const b = tokens[i + 1];
            if (bases.has(a) && b === '们') {
                result.push(a + '们');
                i += 1; // consume '们'
                continue;
            }
            result.push(a);
        }
        return result;
    }

    /**
     * Normalize tokens around "的" for dictionary mode expectations:
     * - Split any multi-char token ending with 的 into [prefix, '的'] (except possessive forms like 你的/我的/...)
     * - If we have pattern [X, Y, '的'] where X and Y are single Han chars, merge X+Y to form a common disyllabic adjective (e.g., 响+亮+的 -> 响亮, 的)
     */
    normalizeDeTokens(tokens, opts?: { contextHeuristics?: boolean, adjectivalHeuristics?: boolean }) {
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
                const adjOn = !!(opts?.adjectivalHeuristics ?? this.plugin?.settings?.chineseAdjectivalHeuristics);
                if (adjOn && this.getContextPairs().has(base)) {
                    // Keep VO的 as a single token
                    split.push(t);
                    continue;
                }
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

    /** Apply custom words from plugin settings into internal sets */
    applyCustomWords() {
        try {
            const list = Array.isArray(this.plugin?.settings?.chineseCustomWords)
                ? this.plugin.settings.chineseCustomWords
                : [];
            this.customWords = new Set(list.filter((w: string) => typeof w === 'string' && w.trim().length > 0).map((w: string) => w.trim()));
            // Also extend dictionary to prefer longer matches in dictionary mode
            for (const w of this.customWords) {
                this.words.add(w);
                if (w.length > this.maxWordLength) this.maxWordLength = Math.min(16, w.length);
            }
        } catch (e) {
            console.warn('Failed to apply custom Chinese words:', e);
        }
    }

    /** Merge tokens to respect custom multi-character phrases defined by user */
    mergeCustomPhrases(tokens: string[]): string[] {
        if (!Array.isArray(tokens) || tokens.length === 0 || this.customWords.size === 0) return tokens || [];
        const result: string[] = [];
        for (let i = 0; i < tokens.length; i++) {
            let merged = null;
            // Try to grow a phrase up to max length 12 tokens (safe cap)
            let acc = tokens[i];
            if (!acc) continue;
            // Only attempt merge if current token is Chinese
            if (!/\p{Script=Han}/u.test(acc)) {
                result.push(acc);
                continue;
            }
            merged = null;
            for (let j = i + 1; j < Math.min(tokens.length, i + 12); j++) {
                const next = tokens[j];
                if (!next) break;
                if (!/\p{Script=Han}/u.test(next)) break; // stop merging across non-Han
                acc += next;
                if (this.customWords.has(acc)) {
                    merged = acc;
                    // Keep trying to see if there's even longer match
                }
            }
            if (merged) {
                // Find how many tokens were consumed
                let consumedLen = 0;
                let tmp = '' + tokens[i];
                for (let k = i + 1; k < tokens.length && tmp.length < merged.length; k++) {
                    tmp += tokens[k];
                    consumedLen++;
                }
                result.push(merged);
                i += consumedLen; // skip consumed tokens
            } else {
                result.push(tokens[i]);
            }
        }
        return result;
    }

    /** Build/refresh context VO pair set from defaults + user config */
    loadContextPairs() {
        try {
            const builtin = [
                '吃饭','睡觉','学习','工作','旅行','购物','说话','打电话','开车',
                '看书','读书','写作业','看电视','听音乐','打游戏','参加考试',
                '上班','下班','做饭','喝水','吃药','跑步','散步','游泳','唱歌',
                '做作业','看电影','拍照','发言','演讲','阅读','写作','练习','复习'
            ];
            const custom = Array.isArray(this.plugin?.settings?.chineseContextPairs)
                ? this.plugin.settings.chineseContextPairs
                : [];
            const set = new Set<string>();
            for (const it of builtin) if (typeof it === 'string' && it.trim()) set.add(it.trim());
            for (const it of custom) if (typeof it === 'string' && it.trim()) set.add(it.trim());
            this.contextPairs = set;
        } catch (e) {
            this.contextPairs = this.contextPairs || new Set();
        }
    }

    /** Safe accessor for current context VO pairs */
    getContextPairs(): Set<string> {
        if (!(this.contextPairs && this.contextPairs.size)) this.loadContextPairs();
        return this.contextPairs || new Set();
    }
}
