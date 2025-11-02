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
        /** @type {Map<string, string[]>} Simple cache for segmentation results */
        this.cache = new Map();
        /** Max cache size */
        this.cacheMax = 500;
        /** External async providers (text, lang) => Promise<string[]|null>|string[]|null */
        this.externalProviders = [];
        /** Timeout per external provider (ms) */
        this.providerTimeoutMs = 300;
        /** Optional text normalizer hook (text=>text), for full ST conversion etc. */
        this.textNormalizers = [];
        /** OpenCC-like normalizer and mode (off|t2s|s2t). Not bundled: set via setOpenCCNormalizer() */
        this.openCCMode = (this.plugin?.settings?.chineseOpenCCMode || 'off');
        this.openCCNormalizer = null;
        /** Frequency bigrams and decision memo for merges */
        this.freqBigrams = new Map();
        this.ngramDecisionCache = new Map();
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

        // Normalize input text (NFKC, basic punctuation unify, optional ST micro-map)
        const input = this.normalizeText(text);
        const cacheKey = input + '|' + JSON.stringify(!!(opts?.contextHeuristics)) + '|' + JSON.stringify(!!(opts?.adjectivalHeuristics));
        const cached = this.cache.get(cacheKey);
        if (cached) return cached.slice();

        // Prefer segmentit when available ONLY if selected in settings (not in 'dictionary' mode)
        const useSegmentit = !!this.segmentit && (this.plugin?.settings?.chineseSegmentation !== 'dictionary');
        if (useSegmentit) {
            try {
                const tokens = this.segmentit.doSegment(input, { simple: true });
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
                filtered = this.mergeByFrequency(filtered);
                filtered = this.mergePossessives(filtered);
                const out = this.normalizeDeTokens(filtered, opts);
                this.remember(cacheKey, out);
                return out;
            } catch (e) {
                console.warn('segmentit failed, falling back to internal matcher:', e);
                // fall through to fallback
            }
        }

        // Fallback: internal maximum matching with our small dictionary
        // We also preserve hard boundaries between Han runs (e.g., whitespace) to avoid
        // merging across explicit separators like "我 们 的" -> keep 的 separate.
        const BOUNDARY = '\u0007';
        const isBoundary = (t: string) => t === BOUNDARY;
        const words: string[] = [];
        let i = 0;
        const maxWordLength = this.maxWordLength || 4;
        while (i < input.length) {
            const char = input[i];
            if (!this.isChineseChar(char)) {
                // Consume a run of non-Han characters and remember if it contained whitespace
                let j = i;
                let sawSpace = false;
                while (j < input.length && !this.isChineseChar(input[j])) {
                    if (/\s/.test(input[j])) sawSpace = true;
                    j++;
                }
                // Insert a boundary marker if we saw explicit spacing between Han runs
                if (sawSpace && words.length > 0 && j < input.length /* next is Han */) {
                    words.push(BOUNDARY);
                }
                i = j;
                continue;
            }
            let found = false;
            let foundWord = null;
            for (let len = Math.min(maxWordLength, input.length - i); len >= 1; len--) {
                const candidate = input.substring(i, i + len);
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
        out = this.mergePronounPlurals(out, BOUNDARY);
        out = this.mergeContextPairs(out, opts);
        out = this.mergeByFrequency(out);
        out = this.mergePossessives(out, BOUNDARY);
        out = this.normalizeDeTokens(out, opts);
        // Remove boundary markers before returning
        const finalOut = out.filter(t => !isBoundary(t));
        this.remember(cacheKey, finalOut);
        return finalOut;
    }

    // No CRF loader required

    /**
     * Merge possessive constructions like 你 + 的 => 你的, 我 + 的 => 我的, 我们 + 的 => 我们的, etc.
     * This aligns counts with common expectations where such forms are treated as single tokens.
     */
    mergePossessives(tokens, BOUNDARY?: string) {
        if (!Array.isArray(tokens) || tokens.length === 0) return tokens || [];
        const pronouns = new Set([
            '我','你','他','她','它',
            '我们','你们','他们','她们','它们',
            '自己'
        ]);
        const merged: string[] = [];
        for (let i = 0; i < tokens.length; i++) {
            const a = tokens[i];
            const b = tokens[i + 1];
            // Standard possessive merge: [Pronoun, '的'] -> [Pronoun的]
            if (b === '的' && pronouns.has(a)) {
                merged.push(a + '的');
                i += 1; // consume '的'
                continue;
            }
            merged.push(a);
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
                // Do NOT absorb trailing 的 here; leave it to normalization (keeps 的 counts stable)
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
    mergePronounPlurals(tokens: string[], BOUNDARY?: string): string[] {
        if (!Array.isArray(tokens) || tokens.length === 0) return tokens || [];
        // Gate plural merging behind context heuristics setting to keep strict tests deterministic
        try {
            const on = !!(this.plugin?.settings?.chineseContextHeuristics);
            if (!on) return tokens || [];
        } catch { return tokens || []; }
        const bases = new Set(['我','你','他','她','它']);
        const result: string[] = [];
        for (let i = 0; i < tokens.length; i++) {
            const a = tokens[i];
            const b = tokens[i + 1];
            // Avoid merging when separated by a boundary
            if (bases.has(a) && b === '们' && !(BOUNDARY && (tokens[i + 1] === BOUNDARY || tokens[i - 1] === BOUNDARY))) {
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
            // Merge words from local custom file if available
            // .obsidian/plugins/<id>/dictionaries/custom_chinese_words.txt, one term per line, '#' comments allowed
            this.loadCustomWordsFromVault().then((fileWords: string[]) => {
                try {
                    for (const w of fileWords) {
                        this.customWords.add(w);
                    }
                    for (const w of this.customWords) {
                        this.words.add(w);
                        if (w.length > this.maxWordLength) this.maxWordLength = Math.min(16, w.length);
                    }
                } catch {}
            }).catch(() => {});
            // Also extend dictionary to prefer longer matches in dictionary mode
            for (const w of this.customWords) {
                this.words.add(w);
                if (w.length > this.maxWordLength) this.maxWordLength = Math.min(16, w.length);
            }
        } catch (e) {
            console.warn('Failed to apply custom Chinese words:', e);
        }
    }

    /** Load custom Chinese words from vault file if present */
    async loadCustomWordsFromVault(): Promise<string[]> {
        try {
            if (!this.plugin || !this.plugin.app?.vault?.adapter) return [];
            const id = this.plugin.manifest?.id || 'word-statistics-ru-en-cn';
            const path = `.obsidian/plugins/${id}/dictionaries/custom_chinese_words.txt`;
            try {
                const text = await this.plugin.app.vault.adapter.read(path);
                if (typeof text !== 'string' || text.trim().length === 0) return [];
                const out: string[] = [];
                for (const line of text.split(/\r?\n/)) {
                    const s = (line || '').trim();
                    if (!s || s.startsWith('#')) continue;
                    if (/\p{Script=Han}/u.test(s)) out.push(s);
                }
                return out;
            } catch {
                return [];
            }
        } catch {
            return [];
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

    /** Normalize text: NFKC, trim, unify dashes, basic ST micro-map and user-provided normalizers */
    normalizeText(text: string): string {
        let s = (text?.normalize ? text.normalize('NFKC') : text) || '';
        s = s.replace(/[\u2013\u2014]/g, '-');
        // External/OpenCC normalizer if provided and enabled
        try {
            if (this.openCCNormalizer && this.openCCMode && this.openCCMode !== 'off') {
                const res = this.openCCNormalizer(s, this.openCCMode);
                if (typeof res === 'string') s = res;
            }
        } catch {}
        for (const norm of this.textNormalizers) {
            try { const ns = norm(s); if (typeof ns === 'string') s = ns; } catch {}
        }
        return s;
    }

    /** Remember result into bounded cache */
    remember(key: string, tokens: string[]): void {
        try {
            this.cache.set(key, tokens.slice());
            if (this.cache.size > this.cacheMax) {
                // naive eviction: delete first inserted key
                const k = this.cache.keys().next();
                if (!k.done) this.cache.delete(k.value);
            }
        } catch {}
    }

    /** Register an external async segmenter provider (text, lang) => string[]|null */
    registerExternalProvider(provider: (text: string, language: 'chinese'|string) => Promise<string[]|null>|string[]|null) {
        if (!this.externalProviders) this.externalProviders = [];
        this.externalProviders.push(provider);
    }

    clearExternalProviders() { this.externalProviders = []; }

    registerTextNormalizer(fn: (text: string) => string) { this.textNormalizers.push(fn); }

    /** Async segmentation: try external providers with timeout; fallback to local segment() */
    async segmentAsync(text: string, opts?: { contextHeuristics?: boolean, adjectivalHeuristics?: boolean }): Promise<string[]> {
        const input = this.normalizeText(text || '');
        const providers = this.externalProviders || [];
        for (const p of providers) {
            try {
                const out = await this.callWithTimeout(Promise.resolve(p(input, 'chinese')), this.providerTimeoutMs);
                if (Array.isArray(out) && out.length) {
                    // Ensure only Han-containing tokens remain; apply merges, then return
                    const han = /\p{Script=Han}/u;
                    let filtered = out.filter(t => typeof t === 'string' && t.trim().length > 0 && han.test(t)).map(t => t.trim());
                    filtered = this.mergeCustomPhrases(filtered);
                    filtered = this.mergePronounPlurals(filtered);
                    filtered = this.mergeContextPairs(filtered, opts);
                    filtered = this.mergePossessives(filtered);
                    filtered = this.normalizeDeTokens(filtered, opts);
                    return filtered;
                }
            } catch {}
        }
        // fall back to local
        return this.segment(input, opts);
    }

    callWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const id = setTimeout(() => reject(new Error('timeout')), Math.max(50, ms|0));
            promise.then(v => { clearTimeout(id); resolve(v); }, err => { clearTimeout(id); reject(err); });
        });
    }

    /** Load frequency bigrams from vault if present (JSON or TSV). Settings can gate minimum count. */
    async loadFrequencies(): Promise<void> {
        try {
            if (!this.plugin || !this.plugin.app?.vault?.adapter) return;
            const id = this.plugin.manifest?.id || 'word-statistics-ru-en-cn';
            const base = `.obsidian/plugins/${id}/dictionaries`;
            const jsonPath = `${base}/chinese_ngrams.json`;
            const tsvPath = `${base}/chinese_bigrams.tsv`;
            // Try JSON first
            try {
                const json = await this.plugin.app.vault.adapter.read(jsonPath);
                const data = JSON.parse(json || '{}');
                if (data && data.bigrams && typeof data.bigrams === 'object') {
                    this.freqBigrams = new Map(Object.entries(data.bigrams as Record<string, number>));
                    return;
                }
            } catch {}
            // Try TSV: token<TAB>count per line
            try {
                const tsv = await this.plugin.app.vault.adapter.read(tsvPath);
                const map = new Map<string, number>();
                for (const line of (tsv || '').split(/\r?\n/)) {
                    const s = (line || '').trim();
                    if (!s || s.startsWith('#')) continue;
                    const [tok, cntStr] = s.split(/\t+/);
                    const cnt = parseInt((cntStr || '0').trim(), 10) || 0;
                    if (tok && cnt > 0) map.set(tok.trim(), cnt);
                }
                if (map.size) this.freqBigrams = map;
            } catch {}
        } catch {}
    }

    /** Merge adjacent single-Han tokens using frequency bigrams or dictionary presence */
    mergeByFrequency(tokens: string[]): string[] {
        try {
            const enable = !!(this.plugin?.settings?.chineseFreqMerging);
            if (!enable) return tokens || [];
        } catch { return tokens || []; }
        if (!Array.isArray(tokens) || tokens.length === 0) return tokens || [];
        const minCount = Math.max(1, this.plugin?.settings?.chineseFreqMergeMinCount || 100);
        const isHanChar = (s: string) => typeof s === 'string' && s.length === 1 && /\p{Script=Han}/u.test(s);
        const out: string[] = [];
        for (let i = 0; i < tokens.length; i++) {
            const a = tokens[i];
            const b = tokens[i + 1];
            if (isHanChar(a) && isHanChar(b)) {
                const combined = a + b;
                let merge = false;
                const memo = this.ngramDecisionCache.get(combined);
                if (typeof memo === 'boolean') {
                    merge = memo;
                } else {
                    const freq = this.freqBigrams.get(combined) || 0;
                    merge = (freq >= minCount) || (!!this.words && this.words.has(combined));
                    this.ngramDecisionCache.set(combined, merge);
                }
                if (merge) {
                    out.push(combined);
                    i += 1;
                    continue;
                }
            }
            out.push(a);
        }
        return out;
    }

    /** Plug in OpenCC-like normalizer and switch mode (off|t2s|s2t) */
    setOpenCCNormalizer(fn: ((text: string, mode: 't2s'|'s2t'|'off') => string)) { this.openCCNormalizer = fn; }
    setOpenCCMode(mode: 't2s'|'s2t'|'off') { this.openCCMode = mode; }
}
