// @ts-nocheck
import { DICTIONARY_URLS, DEFAULT_DICTIONARIES } from "./constants";

// Simple in-memory dictionary text cache per language (speeds language swapping within a session)
const DICT_TEXT_CACHE: Map<string, string> = new Map();

/**
 * Lemmatizer class for word form reduction to base forms
 * Supports loading dictionaries from GitHub or using fallback defaults
 */
export class Lemmatizer {
    /** Initialize a new Lemmatizer instance */
    constructor(plugin?: any) {
        this.plugin = plugin || null;
        /** @type {Map<string, string>} Map of word forms to lemmas */
        this.lemmas = new Map();
        /** @type {boolean} Whether the dictionary has been successfully loaded */
        this.loaded = false;
        /** @type {string|null} Language of this lemmatizer */
        this.language = null;
    /** @type {{advancedFallback?: boolean|"simple", allowParticipleToVerb?: boolean}} Options that influence lemmatization */
    this.options = { advancedFallback: false, allowParticipleToVerb: false };
        /** @type {{[k:string]: number}} Diagnostics counters for rule application */
        this.counters = {
            dictionary: 0,
            external: 0,
            ruVerb: 0,
            ruPartGer: 0,
            ruAdj: 0,
            ruNoun: 0,
            ruFallback: 0
        };
        /** External lemmatization providers (async functions) */
        this.externalProviders = [];
        /** Timeout for each external provider call (ms) */
        this.providerTimeoutMs = 200;
    }

    async loadDictionary(language) {
        try {
            console.log(`📥 Loading ${language} dictionary...`);
            
            if (!language || !DICTIONARY_URLS[language]) {
                throw new Error(`Invalid language: ${language}`);
            }
            
            // Prefer LOCAL dictionary file if present in the plugin folder inside the vault
            try {
                const localText = await this.readLocalDictionary(language);
                if (localText) {
                    this.parseDictionary(localText);
                    await this.loadCustomAdditions(language);
                    // Refresh cache with local content for determinism
                    DICT_TEXT_CACHE.set(language, localText);
                    this.loaded = true;
                    this.language = language;
                    console.log(`✅ ${language} dictionary loaded from LOCAL plugin folder`);
                    return;
                }
            } catch (e) {
                console.warn(`Local ${language} dictionary not available or failed to read:`, e);
            }

            // If we have cached full dictionary text, reuse it
            const cachedText = DICT_TEXT_CACHE.get(language);
            if (cachedText) {
                this.parseDictionary(cachedText);
                await this.loadCustomAdditions(language);
                this.loaded = true;
                this.language = language;
                console.log(`⚡ Used cached ${language} dictionary text (${this.lemmas.size} entries)`);
                return;
            }

            // Try to load from GitHub first with timeout (unless user prefers local-only)
            const preferLocalOnly = !!this.plugin?.settings?.preferLocalDictionaries;
            if (!preferLocalOnly) {
            try {
                const controller = new AbortController();
                const timeoutMs = Math.max(1000, Math.min(60000, (this.plugin?.settings?.networkTimeoutMs ?? 10000)));
                const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
                
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
                    await this.loadCustomAdditions(language);
                    // Cache text for fast reloads
                    DICT_TEXT_CACHE.set(language, content);
                    console.log(`✅ ${language} dictionary loaded from GitHub: ${this.lemmas.size} entries`);
                    // Persist fetched dictionary locally for offline reuse (only current language)
                    try { await this.saveLocalDictionary(language, content); } catch {}
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
            } else {
                console.log(`🌐 Online fetch disabled by settings, using local/default for ${language}`);
            }

            // Fallback to default dictionary
            if (!DEFAULT_DICTIONARIES[language]) {
                throw new Error(`No default dictionary available for ${language}`);
            }
            
            this.parseDictionary(DEFAULT_DICTIONARIES[language]);
            await this.loadCustomAdditions(language);
            // Cache default text, too
            DICT_TEXT_CACHE.set(language, DEFAULT_DICTIONARIES[language]);
            console.log(`✅ ${language} default dictionary loaded: ${this.lemmas.size} entries`);
            this.loaded = true;
            
        } catch (error) {
            console.error(`❌ Critical error loading ${language} dictionary:`, error);
            this.loaded = false;
            this.lemmas.clear();
            throw new Error(`Failed to load ${language} dictionary: ${error.message}`);
        }
        // Save language after successful load
        this.language = language;
    }

    /** Load and merge user custom lemma additions from a separate file (non-destructive) */
    async loadCustomAdditions(language: string) {
        try {
            if (!this.plugin || !this.plugin.app?.vault?.adapter) return;
            const id = this.plugin.manifest?.id || 'word-statistics-ru-en-cn';
            const folder = `.obsidian/plugins/${id}/dictionaries`;
            const fileMap: Record<string, string> = {
                russian: `${folder}/custom_russian_lemmas.txt`,
                english: `${folder}/custom_english_lemmas.txt`
            };
            const path = fileMap[language];
            if (!path) return;
            let exists = false;
            try {
                const stat = await this.plugin.app.vault.adapter.stat(path);
                exists = !!(stat && stat.exists);
            } catch {}
            if (!exists) return;
            const text = await this.plugin.app.vault.adapter.read(path);
            if (!text || typeof text !== 'string') return;
            const lines = text.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;
                const [wf, lm] = trimmed.split('=');
                if (wf && lm) {
                    const w = wf.trim().toLowerCase();
                    const l = lm.trim().toLowerCase();
                    if (w && l) this.lemmas.set(w, l);
                }
            }
            console.log(`➕ Merged custom ${language} lemmas (${lines.length} lines)`);
        } catch (e) {
            console.warn('Custom additions load skipped:', e);
        }
    }

    /** Save dictionary text into the local plugin folder for the given language */
    async saveLocalDictionary(language: string, content: string): Promise<void> {
        try {
            if (!this.plugin || !this.plugin.app?.vault?.adapter) return;
            const id = this.plugin.manifest?.id || 'word-statistics-ru-en-cn';
            const folder = `.obsidian/plugins/${id}/dictionaries`;
            try {
                // Ensure folder exists
                await this.plugin.app.vault.adapter.mkdir(folder);
            } catch {}
            const fileMap: Record<string, string> = {
                russian: `${folder}/russian_lemmas.txt`,
                english: `${folder}/english_lemmas.txt`,
                chinese: `${folder}/chinese_words.txt`
            };
            const path = fileMap[language];
            if (!path) return;
            await this.plugin.app.vault.adapter.write(path, content);
            console.log(`💾 Saved ${language} dictionary locally for offline use`);
        } catch {
            // non-fatal
        }
    }

    /** Try read dictionary from local plugin folder inside the vault (non-blocking fallback) */
    async readLocalDictionary(language: string): Promise<string|null> {
        try {
            if (!this.plugin || !this.plugin.app?.vault?.adapter) return null;
            const id = this.plugin.manifest?.id || 'word-statistics-ru-en-cn';
            const fileMap: Record<string, string> = {
                russian: `.obsidian/plugins/${id}/dictionaries/russian_lemmas.txt`,
                english: `.obsidian/plugins/${id}/dictionaries/english_lemmas.txt`,
                chinese: `.obsidian/plugins/${id}/dictionaries/chinese_words.txt`
            };
            const path = fileMap[language];
            if (!path) return null;
            // Prefer a direct read attempt (some adapters may not support stat reliably)
            try {
                const text = await this.plugin.app.vault.adapter.read(path);
                if (typeof text === 'string' && text.trim().length > 0) {
                    console.log(`📚 Found LOCAL ${language} dictionary at ${path} (${text.length} chars)`);
                    return text;
                }
            } catch (readErr) {
                // Fallback: try stat+read if available
                try {
                    const stat = await this.plugin.app.vault.adapter.stat(path);
                    if (stat && stat.exists) {
                        const text2 = await this.plugin.app.vault.adapter.read(path);
                        if (typeof text2 === 'string' && text2.trim().length > 0) {
                            console.log(`📚 Found LOCAL ${language} dictionary via stat at ${path} (${text2.length} chars)`);
                            return text2;
                        }
                    }
                } catch {}
            }
            return null;
        } catch (e) {
            return null;
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
                        // Single token line: add as self-mapping (useful for small dictionaries or word-lists)
                        const cleanWordform = wordform.trim();
                        if (cleanWordform.length > 0) {
                            // preserve casefold for keys (lemmas stored lowercased elsewhere)
                            this.lemmas.set(cleanWordform.toLowerCase(), cleanWordform.toLowerCase());
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
        
        // Normalize input and try multiple dictionary variants first
        const normalized = this.normalizeWord(word);
        // Try dictionary variants (handles reflexive, hyphen, ё->е, etc.)
        const dictFound = this.tryDictionaryVariants(normalized);
        if (dictFound) return dictFound;

        // Note: external providers are async; use lemmatizeAsync() if you want them considered
        
        // Language-specific simple fallback rules
        if (this.language === 'russian') {
            // Fallback behavior:
            // - advancedFallback === true  -> advanced heuristic rules
            // - advancedFallback === 'simple' -> simple suffix stripping
            // - otherwise (default/false/undefined) -> NO fallback, return original
            if (this.options?.advancedFallback === true) {
                return this.russianAdvancedFallbackLemma(normalized);
            }
            if (this.options?.advancedFallback === 'simple') {
                try { this.counters.ruFallback++; } catch {}
                return this.russianFallbackLemma(normalized);
            }
            // No fallback: keep as-is so users can review/add correct lemmas
            return normalized;
        }

        // If no lemma found, return normalized word
        return normalized;
    }

    /** Async version which tries external providers as well */
    async lemmatizeAsync(word: string): Promise<string> {
        if (!this.loaded || !word || typeof word !== 'string') {
            return word ? word.toLowerCase() : '';
        }
        const normalized = this.normalizeWord(word);
        const dictFound = this.tryDictionaryVariants(normalized);
        if (dictFound) return dictFound;

        // Try external providers (if any) before rule-based fallbacks
        if (this.externalProviders && this.externalProviders.length > 0) {
            const fromExt = await this.tryExternalProviders(normalized, this.language || '');
            if (fromExt) {
                try { this.counters.external++; } catch {}
                return fromExt;
            }
        }

        if (this.language === 'russian') {
            if (this.options?.advancedFallback === true) {
                return this.russianAdvancedFallbackLemma(normalized);
            }
            if (this.options?.advancedFallback === 'simple') {
                try { this.counters.ruFallback++; } catch {}
                return this.russianFallbackLemma(normalized);
            }
            return normalized;
        }
        return normalized;
    }

    getStats() {
        return {
            loaded: this.loaded,
            entries: this.lemmas.size,
            counters: Object.assign({}, this.counters)
        };
    }

    /** Normalize input word: NFKC, lower, trim, collapse punctuation and normalize ё->е */
    normalizeWord(w: string): string {
        if (!w || typeof w !== 'string') return '';
        // Unicode normalize, lowercase, trim
        let s = w.normalize ? w.normalize('NFKC') : w;
        s = s.toLowerCase().trim();
        // Normalize ë to е for Russian
        s = s.replace(/ё/g, 'е');
        // Remove surrounding punctuation and quotes
        s = s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
        // Remove common interior punctuation (except hyphen and apostrophe which can be meaningful)
        s = s.replace(/["“”'«»()\[\]{}.,:;!?]+/g, '');
        // Collapse multiple hyphens/underscores and trim them from ends
        s = s.replace(/[_–—]+/g, '-');
        s = s.replace(/-{2,}/g, '-');
        s = s.replace(/^-+|-+$/g, '');
        return s;
    }

    /** Try multiple dictionary lookup variants (reflexive removed, ë->е, hyphen parts, punctuation stripped) */
    tryDictionaryVariants(cleanWord: string): string | null {
        if (!cleanWord) return null;
        const tried = new Set<string>();
        const candidates: string[] = [];

        // raw
        candidates.push(cleanWord);
        // remove reflexive marker
        if (/(ся|сь)$/.test(cleanWord)) candidates.push(cleanWord.replace(/(ся|сь)$/, ''));
        // variant with ё->е already applied by normalizeWord, but attempt original if user toggled
        candidates.push(cleanWord.replace(/ё/g, 'е'));
        // try removing internal hyphen (common in compound words)
        if (cleanWord.includes('-')) {
            candidates.push(cleanWord.replace(/-/g, ''));
            // try each hyphen component individually (last component more likely lemma)
            const parts = cleanWord.split('-').filter(Boolean);
            for (const p of parts) candidates.push(p);
        }
        // strip trailing single-letter possessive/particles (e.g., 's' for english, not for ru) - keep minimal
        candidates.push(cleanWord.replace(/[’'`]$/g, ''));

        // small curated irregulars not necessarily present in dictionaries
        const EXTRA: Record<string, string> = {
            'дети': 'ребенок',
            'детей': 'ребенок', 'детям': 'ребенок', 'детьми': 'ребенок', 'детях': 'ребенок',
            'люди': 'человек',
            'людей': 'человек', 'людям': 'человек', 'людьми': 'человек', 'людях': 'человек',
            'друзья': 'друг', 'друзей': 'друг', 'друзьям': 'друг', 'друзьями': 'друг', 'друзьях': 'друг',
            'листья': 'лист', 'листьев': 'лист', 'листьям': 'лист', 'листьями': 'лист', 'листьях': 'лист',
            'деревья': 'дерево', 'деревьев': 'дерево', 'деревьям': 'дерево', 'деревьями': 'дерево', 'деревьях': 'дерево',
            'ребята': 'ребенок',
            'мальчики': 'мальчик',
            'девочки': 'девочка'
        };

        for (const cand of candidates) {
            if (!cand) continue;
            const key = cand.toLowerCase();
            if (tried.has(key)) continue;
            tried.add(key);
            if (this.lemmas.has(key)) {
                try { this.counters.dictionary++; } catch {}
                return this.lemmas.get(key);
            }
            if (this.language === 'russian' && EXTRA[key]) return EXTRA[key];
        }
        return null;
    }

    /** Register an external async provider: (word, language) => Promise<string|null>|string|null */
    registerExternalProvider(provider: (word: string, language: string) => Promise<string|null>|string|null) {
        if (!this.externalProviders) this.externalProviders = [];
        this.externalProviders.push(provider);
    }

    clearExternalProviders() {
        this.externalProviders = [];
    }

    /** Call external providers one by one with timeout, return first non-null result */
    async tryExternalProviders(word: string, language: string): Promise<string|null> {
        const providers = this.externalProviders || [];
        for (const p of providers) {
            try {
                const result = await this.callWithTimeout(Promise.resolve(p(word, language)), this.providerTimeoutMs);
                if (typeof result === 'string' && result.trim()) {
                    return result.trim().toLowerCase();
                }
            } catch (_) {
                // ignore provider errors/timeouts
            }
        }
        return null;
    }

    /** Promise timeout helper */
    callWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const id = setTimeout(() => reject(new Error('timeout')), Math.max(50, ms|0));
            promise.then(v => { clearTimeout(id); resolve(v); }, err => { clearTimeout(id); reject(err); });
        });
    }

    // Very lightweight Russian fallback lemmatizer using common suffix stripping
    russianFallbackLemma(w: string): string {
        if (!w) return w;
        // Normalize ё -> е
        let s = w.replace(/ё/g, 'е');
        // Handle short words quickly
        if (s.length <= 3) return s;

        // Common adjective endings
        const adj = [
            'ыми','ими','его','ого','ему','ому','ее','ое','ая','яя','ий','ый','ой','ая','яя','ую','юю','их','ых','ым','им','ем','им','ом'
        ];
        // Common noun plural/case endings
        const noun = [
            'ами','ями','ами','ями','ьев','ев','ов','ами','ями','ями','ами','ями','ах','ях','ам','ям','ою','ею','ью','ью','ей','ой','ам','ям',
            'ию','ью','ью','ям','ам','ии','ии','ии','ях','ах','ам','ям','ях','ах','ам','ям','ою','ею'
        ];
        // Common verb endings
        const verb = [
            'ешь','ешься','ете','етесь','ем','емся','ут','ют','ят','ишь','ит','ите','им','или','или','ать','ять','ить','ешь','ет','ете','ем',
            'ал','ала','ало','али','ился','алась','ались','ался','лся','ться','ться','ться','лся','лась','лось','лись'
        ];

        const strip = (arr: string[]): string | null => {
            for (const suf of arr) {
                if (s.length > suf.length + 1 && s.endsWith(suf)) {
                    return s.slice(0, -suf.length);
                }
            }
            return null;
        };

        let base = strip(adj) || strip(noun) || strip(verb);
        if (base && base.length >= 3) return base;

        // Final fallback: drop a single trailing vowel/soft sign if present
        if (/[аеёиоуыэюяь]$/.test(s) && s.length > 3) {
            return s.slice(0, -1);
        }
        return s;
    }

    // Advanced Russian fallback lemmatizer with verb infinitive and common noun-case recovery
    russianAdvancedFallbackLemma(w: string): string {
        if (!w) return w;
        let s = w.replace(/ё/g, 'е');
        if (s.length <= 3) return s;

        // Known irregular or highly frequent alternations (very small curated set)
        const IRREGULAR: Record<string, string> = {
            // 3pl → infinitive
            'идут': 'идти', 'едут': 'ехать', 'ведут': 'вести', 'могут': 'мочь', 'хотят': 'хотеть',
            'берут': 'брать', 'пишут': 'писать', 'режут': 'резать', 'ждут': 'ждать',
            'бегут': 'бежать',
            // slang/common internet verbs often used
            'рофлят': 'рофлить',
            // frequent nouns/pronouns exceptions (nominative singular restoration)
            'дверей': 'дверь',
            'сыновьями': 'сын', 'сыновьям': 'сын', 'сыновей': 'сын', 'сыновьях': 'сын',
            'копеек': 'копейка',
            // irregular plural → lemma (duplicates here for advanced path)
            'дети': 'ребенок','детей': 'ребенок','детям': 'ребенок','детьми': 'ребенок','детях': 'ребенок',
            'люди': 'человек','людей': 'человек','людям': 'человек','людьми': 'человек','людях': 'человек',
            'друзья': 'друг','друзей': 'друг','друзьям': 'друг','друзьями': 'друг','друзьях': 'друг',
            'листья': 'лист','листьев': 'лист','листьям': 'лист','листьями': 'лист','листьях': 'лист',
            'деревья': 'дерево','деревьев': 'дерево','деревьям': 'дерево','деревьями': 'дерево','деревьях': 'дерево',
            // numerals (compact)
            'двух': 'два', 'двум': 'два', 'двумя': 'два',
            'трех': 'три', 'трёх': 'три', 'трем': 'три', 'трём': 'три', 'тремя': 'три',
            'четырех': 'четыре', 'четырёх': 'четыре', 'четырем': 'четыре', 'четырём': 'четыре', 'четырьмя': 'четыре',
            'пяти': 'пять', 'пятью': 'пять',
            'шести': 'шесть', 'шестью': 'шесть',
            'семи': 'семь', 'семью': 'семь',
            'восьми': 'восемь', 'восьмью': 'восемь',
            'девяти': 'девять', 'девятью': 'девять',
            'десяти': 'десять', 'десятью': 'десять',
            // pronouns (compact)
            'нее': 'она', 'неё': 'она',
            'твоим': 'твой', 'твоего': 'твой', 'твоему': 'твой', 'твоем': 'твой', 'твоём': 'твой', 'твоими': 'твой', 'твоих': 'твой', 'твой': 'твой', 'твоя': 'твой', 'твое': 'твой', 'твоё': 'твой', 'твои': 'твой', 'твоей': 'твой', 'твою': 'твой',
            'моим': 'мой', 'моего': 'мой', 'моему': 'мой', 'моем': 'мой', 'моём': 'мой', 'моими': 'мой', 'моих': 'мой', 'мой': 'мой', 'моя': 'мой', 'мое': 'мой', 'моё': 'мой', 'мои': 'мой', 'моей': 'мой', 'мою': 'мой',
            // этот
            'этот': 'этот', 'эта': 'этот', 'это': 'этот', 'эти': 'этот', 'этого': 'этот', 'этой': 'этот', 'этому': 'этот', 'этим': 'этот', 'этом': 'этот', 'эту': 'этот', 'этими': 'этот', 'этих': 'этот',
            // весь
            'весь': 'весь', 'вся': 'весь', 'всё': 'весь', 'все': 'весь',
            'всего': 'весь', 'всей': 'весь', 'всему': 'весь', 'всем': 'весь', 'всём': 'весь', 'всех': 'весь', 'всеми': 'весь', 'всю': 'весь',
            // свой
            'свой': 'свой', 'своя': 'свой', 'своё': 'свой', 'свое': 'свой', 'свои': 'свой', 'своего': 'свой', 'своей': 'свой', 'своему': 'свой', 'своём': 'свой', 'своем': 'свой', 'своим': 'свой', 'своих': 'свой', 'своими': 'свой', 'свою': 'свой',
            // такой
            'такой': 'такой', 'такая': 'такой', 'такое': 'такой', 'такие': 'такой', 'такого': 'такой', 'такой-то': 'такой', 'такому': 'такой', 'таким': 'такой', 'таком': 'такой', 'таких': 'такой', 'такими': 'такой', 'такую': 'такой',
            // самый и сам
            'самый': 'самый', 'самая': 'самый', 'самое': 'самый', 'самые': 'самый', 'самого': 'самый', 'самой': 'самый', 'самому': 'самый', 'самым': 'самый', 'самом': 'самый', 'самых': 'самый', 'самыми': 'самый', 'самую': 'самый',
            'сам': 'сам', 'сама': 'сам', 'само': 'сам', 'сами': 'сам', 'самим': 'сам', 'самих': 'сам', 'самими': 'сам', 'саму': 'сам',
            // вопросы/местоимения (частичные)
            'ничего': 'ничто', 'ничему': 'ничто', 'ничем': 'ничто', 'ничём': 'ничто', 'ничем-то': 'ничто',
            'чего': 'что', 'чему': 'что', 'чем': 'что', 'чём': 'что', 'кому': 'кто', 'кого': 'кто', 'кем': 'кто', 'ком': 'кто',
            // частые наречия, которые не надо “обрезать”
            'прямо': 'прямо'
        };
        if (IRREGULAR[s]) return IRREGULAR[s];

        // Helper to return and count rule usage
        const ret = (value: string, rule: 'ruVerb'|'ruPartGer'|'ruAdj'|'ruNoun'|'ruFallback'): string => {
            try { this.counters[rule] = (this.counters[rule] || 0) + 1; } catch {}
            return value;
        };

        // Helper: choose infinitive ending based on last vowel in the stem and original suffix
        const chooseInf = (stem: string, originalSuffix: string, reflexive: boolean, hint?: 'ать'|'ять'|'еть'|'ить'): string => {
            const vowels = ['а','я','е','и','о','у','ы','ю'];
            let lastVowel = '';
            for (let i = stem.length - 1; i >= 0; i--) {
                const ch = stem[i];
                if (vowels.includes(ch)) { lastVowel = ch; break; }
            }
            // Heuristic special-cases before generic vowel-based choice
            if (!hint) {
                // Many colloquial/obscene verbs with -еб- take -ать: проебать/наебать
                if (/еб$/.test(stem)) hint = 'ать';
            }
            let inf = hint || 'ить';
            if (lastVowel === 'а') inf = 'ать';
            else if (lastVowel === 'я') inf = 'ять';
            else if (lastVowel === 'е') inf = 'еть';
            else if (lastVowel === 'и' || lastVowel === 'ы') inf = 'ить';
            else if (['ут','ют','ат','ят','ет','ешь','ем','ете'].includes(originalSuffix)) {
                // For 1st conjugation hints, prefer -ать if we don't see a clear -ить signal
                if (!hint) inf = (lastVowel === 'и') ? 'ить' : 'ать';
            }
            let res = stem + inf;
            if (reflexive) res = res.replace(/ть$/, 'ться');
            return res;
        };

        // Handle reflexive marker upfront
        let hadReflexive = false;
        if (/(ся|сь)$/.test(s)) {
            hadReflexive = true;
            s = s.replace(/(ся|сь)$/, '');
        }

        // Try participles and gerunds → verb infinitive
        // Gate participles by option allowParticipleToVerb to avoid converting adjectives into verbs by default
        const stripToVerbByPattern = (str: string): string | null => {
            const tryReturn = (stem: string) => stem.length >= 2 ? (hadReflexive ? stem + 'ться' : stem + 'ть') : null;
            // -вши / -в (прочитавши → прочитать, прочитав → прочитать)
            if (/вши$/.test(str)) {
                const stem = str.replace(/вши$/, '');
                const res = tryReturn(stem);
                if (res) return res;
            }
            if (/[^аеиоуыэюя]в$/.test(str) || /[аеиоуыэюя]в$/.test(str)) {
                const stem = str.replace(/в$/, '');
                const res = tryReturn(stem);
                if (res) return res;
            }
            // Participles (adjectival) → verb only when explicitly allowed to avoid mis-converting adjectives
            if (this.options?.allowParticipleToVerb) {
                // -ущ-/-ющ- participles (читающий → читать)
                if (/(у|ю)щ[а-я]*$/.test(str)) {
                    const stem = str.replace(/(у|ю)щ[а-я]*$/, '');
                    const res = tryReturn(stem);
                    if (res) return res;
                }
                // Passive participles: -енн-/-ённ-/-анн-/-янн- + endings
                if (/(енн|ённ|анн|янн)[а-я]*$/.test(str)) {
                    const stem = str.replace(/(енн|ённ|анн|янн)[а-я]*$/, '');
                    const res = tryReturn(stem);
                    if (res) return res;
                }
            }
            return null;
        };
    const fromPartGer = stripToVerbByPattern(s);
    if (fromPartGer) return ret(fromPartGer, 'ruPartGer');

        // Verb forms → infinitive
        const verbSuffixes = ['ешь','ет','ем','ете','ют','ут','ат','ят','ишь','ит','им','ите','ал','ала','ало','али','л','нут'];
        for (const suf of verbSuffixes) {
            if (s.length > suf.length + 1 && s.endsWith(suf)) {
                let stem = s.slice(0, -suf.length);
                if (stem.length >= 2) {
                    // Special: -нут (крикнут → крикнуть)
                    if (suf === 'нут') {
                        const res = stem + 'нуть';
                        return ret(hadReflexive ? res.replace(/ть$/, 'ться') : res, 'ruVerb');
                    }
                    // Consonant alternations before -ут/-ют (пишут→писать, режут→резать)
                    if ((suf === 'ут' || suf === 'ют') && /[шж]$/.test(stem)) {
                        stem = stem.replace(/ш$/, 'с').replace(/ж$/, 'з');
                        return ret(chooseInf(stem, suf, hadReflexive, 'ать'), 'ruVerb');
                    }
                    // Heuristic: stems ending with -л before -ят (гуглят/рофлят → -ить)
                    if (suf === 'ят' && /л$/.test(stem)) {
                        return ret(chooseInf(stem, suf, hadReflexive, 'ить'), 'ruVerb');
                    }
                    // Default heuristic
                    return ret(chooseInf(stem, suf, hadReflexive), 'ruVerb');
                }
            }
        }
        // Special: already infinitive 'ться' or 'ть'
        if (s.endsWith('ться')) return ret(s, 'ruVerb'); // already reflexive infinitive
        if (s.endsWith('ть')) return ret(s, 'ruVerb');   // already infinitive

        // Adjectives → masculine nominative singular (-ый/-ий/-ой)
        const adjEndings = [
            'ая','яя','ое','ее','ые','ие','ого','его','ому','ему','ым','им','ых','их','ой','ей','ую','юю','ом','ем'
        ];
        for (const end of adjEndings) {
            if (s.length > end.length + 1 && s.endsWith(end)) {
                const stem = s.slice(0, -end.length);
                if (stem.length >= 2) {
                    // Heuristic to choose -ий vs -ый: soft stems and historically -ий adjectives prefer -ий
                    const softStem = /[йьжчшщ]$/.test(stem) || /нин$/.test(stem) || /син$/.test(stem);
                    const masculine = softStem ? stem + 'ий' : stem + 'ый';
                    return ret(masculine, 'ruAdj');
                }
            }
        }

        // Noun/adjective common case recovery to nominative singular
        // Specific productive patterns first
        // e.g., копеек -> копейка (…еек → …ейка)
        if (/^[а-я]+еек$/.test(s)) {
            const base = s.replace(/еек$/, 'ейка');
            if (base.length >= 3) return ret(base, 'ruNoun');
        }
        // сыновья-* → сын
        if (/^сыновья(ми|м|х)?$/.test(s) || /^сынов(ей|ям|ью|ях)$/.test(s)) {
            return ret('сын', 'ruNoun');
        }
        // дверей -> дверь (…р + ей → …рь)
        if (s.endsWith('ей')) {
            const stem = s.slice(0, -2);
            if (/р$/.test(stem)) {
                const cand = stem + 'ь';
                if (cand.length >= 2) return ret(cand, 'ruNoun');
            }
        }
        // Productive diminutive plural patterns: девочек → девочка; зайчиков? (консервативно для -очка/-ечка/-ушка)
        const diminutiveMap: Array<[RegExp, string]> = [
            [/очек$/,'очка'],
            [/ечек$/,'ечка'],
            [/ушек$/,'ушка'],
            [/юшек$/,'юшка'],
            [/шек$/,'шка'] // keep last (most general)
        ];
        for (const [re, repl] of diminutiveMap) {
            if (re.test(s) && s.length > 4) {
                const base = s.replace(re, repl);
                if (base.length >= 3) return ret(base, 'ruNoun');
            }
        }
        // Handle -ция nouns explicitly (лемматизации → лемматизация)
        const tsiaToTsiya: string[] = ['цией','цию','ции','ций','цам','цами','циях'];
        for (const end of tsiaToTsiya) {
            if (s.length > end.length + 1 && s.endsWith(end)) {
                const base = s.slice(0, -end.length) + 'ция';
                if (base.length >= 3) return ret(base, 'ruNoun');
            }
        }
        // Patterns for -ия nouns
        const iaPatterns: Array<[string,string]> = [
            ['ии','ия'], ['ией','ия'], ['ию','ия'], ['ие','ие']
        ];
        for (const [end, repl] of iaPatterns) {
            if (s.length > end.length + 1 && s.endsWith(end)) {
                const base = s.slice(0, -end.length) + repl;
                if (base.length >= 3) return ret(base, 'ruNoun');
            }
        }
        // Simple case endings for -a/-я/-о/-е nouns and adjectives
        const caseEnds: string[] = [
            'ами','ями','ами','ях','ах','ам','ям','ою','ею','ой','ей','ую','юю','ых','их','ым','им','ом','ем','у','ю','е','а','я'
        ];
        for (const end of caseEnds) {
            if (s.length > end.length + 1 && s.endsWith(end)) {
                const base = s.slice(0, -end.length);
                if (base.length >= 3) return ret(base, 'ruNoun');
            }
        }

        // Keep adverbs ending in -о/-е as-is when no better rule matched (e.g., "прямо", "тихо")
        if ((/о$/.test(s) || /е$/.test(s)) && s.length > 3) {
            return ret(s, 'ruFallback');
        }

        // Final fallback: drop a single trailing vowel/soft sign
        if (/[аеёиоуыэюяь]$/.test(s) && s.length > 3) {
            return ret(s.slice(0, -1), 'ruFallback');
        }
        return ret(s, 'ruFallback');
    }

    /** Update options from caller */
    setOptions(opts: any) {
        this.options = Object.assign({}, this.options, opts || {});
    }
}
