// @ts-nocheck
import { DICTIONARY_URLS, DEFAULT_DICTIONARIES } from "../constants";

function fetchWithTimeout(url: string, ms = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

type DictStats = {
  lines: number;
  valid: number;
  invalid: number;
  duplicates: number;
  blankSides: number;
  suspicious: number;
  uniqueEntries: number;
};

function validateContent(language: string, content: string): { stats: DictStats; issues: string[] } {
  const issues: string[] = [];
  let lines = 0, valid = 0, invalid = 0, duplicates = 0, blankSides = 0, suspicious = 0;
  const seen = new Set<string>();

  const isChinese = language === 'chinese';
  const rows = (content || '').split('\n');

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    lines++;

    if (isChinese) {
      // Just a token per line
      const token = line;
      if (token.length === 0) {
        blankSides++;
        invalid++;
        issues.push(`[${language}] Empty token at line ${i + 1}`);
        continue;
      }
      if (seen.has(token)) {
        duplicates++;
      }
      seen.add(token);
      valid++;
      continue;
    }

    // Expect wordform=lemma
    const eq = line.indexOf('=');
    if (eq === -1) {
      invalid++;
      issues.push(`[${language}] Missing '=' at line ${i + 1}: ${line.slice(0, 60)}`);
      continue;
    }
    const left = line.slice(0, eq).trim().toLowerCase();
    const right = line.slice(eq + 1).trim().toLowerCase();
    if (left.length === 0 || right.length === 0) {
      blankSides++;
    }
    const key = `${left}=${right}`;
    if (seen.has(key)) {
      duplicates++;
    }
    seen.add(key);

    // Minimal sanity checks
    // 1) english/russian letters only (basic heuristic)
    const onlyLetters = /^[\p{L}'’-]+$/u;
    if (!onlyLetters.test(left) || !onlyLetters.test(right)) {
      suspicious++;
    }
    // 2) lemma too short
    if (right.length < 2) {
      suspicious++;
    }

    valid++;
  }

  const stats: DictStats = {
    lines,
    valid,
    invalid,
    duplicates,
    blankSides,
    suspicious,
    uniqueEntries: seen.size,
  };
  return { stats, issues };
}

export async function validateDictionaries(): Promise<{ report: string }> {
  const langs = Object.keys(DICTIONARY_URLS) as Array<'russian' | 'english' | 'chinese'>;
  let report = 'Dictionary validation report\n\n';

  for (const lang of langs) {
    // Remote
    let remoteText = '';
    try {
      const res = await fetchWithTimeout(DICTIONARY_URLS[lang], 10000);
      if (res.ok) remoteText = await res.text();
    } catch (e) {
      // ignore network errors, we'll still validate defaults
    }

    const defaultText = DEFAULT_DICTIONARIES[lang] || '';

    const remoteRes = remoteText ? validateContent(lang, remoteText) : null;
    const defaultRes = validateContent(lang, defaultText);

    report += `== ${lang.toUpperCase()} ==\n`;

    if (remoteRes) {
      const s = remoteRes.stats;
      report += `Remote: lines=${s.lines}, valid=${s.valid}, invalid=${s.invalid}, duplicates=${s.duplicates}, blanks=${s.blankSides}, suspicious=${s.suspicious}\n`;
      if (remoteRes.issues.length) {
        report += `  Examples: ${remoteRes.issues.slice(0, 5).join(' | ')}\n`;
      }
    } else {
      report += `Remote: unavailable (network or URL issue)\n`;
    }

    const ds = defaultRes.stats;
    report += `Defaults: lines=${ds.lines}, valid=${ds.valid}, invalid=${ds.invalid}, duplicates=${ds.duplicates}, blanks=${ds.blankSides}, suspicious=${ds.suspicious}\n`;
    if (defaultRes.issues.length) {
      report += `  Examples: ${defaultRes.issues.slice(0, 5).join(' | ')}\n`;
    }

    report += `\n`;
  }

  return { report };
}
