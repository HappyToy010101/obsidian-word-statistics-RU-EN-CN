/*
  Optimize dictionaries in ./dictionaries
  - Trim/normalize whitespace and Unicode (NFC)
  - Unify punctuation (apostrophes/hyphens)
  - Lowercase for EN/RU; Chinese unchanged
  - Deduplicate and sort
  - Keep a compact header with stats
  Usage:
    node scripts/optimize-dictionaries.js          # rewrite files
    node scripts/optimize-dictionaries.js --stats  # only print stats
*/

const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DICT_DIR = path.join(ROOT, 'dictionaries');

const FILES = {
  chinese: 'chinese_words.txt',
  english: 'english_lemmas.txt',
  russian: 'russian_lemmas.txt',
};

const ONLY_STATS = process.argv.includes('--stats');

function stripBOM(text) {
  return text.replace(/^\uFEFF/, '');
}

function unifyPunct(s) {
  // Normalize common Unicode punctuation to ASCII equivalents for stability
  return s
    .replace(/[\u2018\u2019\u02BC]/g, "'") // apostrophes to '
    .replace(/[\u2013\u2014\u2212]/g, '-')   // dashes to '-'
    .replace(/[\u00A0]/g, ' ')                // nbsp to space
    .replace(/\s+/g, ' ')                     // collapse spaces
    .trim();
}

function normStr(s, { lower = true, mapYo = true } = {}) {
  if (!s) return '';
  let t = s.normalize('NFC');
  t = unifyPunct(t);
  if (mapYo) t = t.replace(/ё/g, 'е').replace(/Ё/g, 'е');
  if (lower) t = t.toLowerCase();
  return t.trim();
}

async function readDict(file) {
  const p = path.join(DICT_DIR, file);
  const raw = await fs.readFile(p, 'utf8');
  return stripBOM(raw);
}

async function writeDict(file, lines, header) {
  const p = path.join(DICT_DIR, file);
  const content = [header, ...lines].join('\n') + '\n'; // LF endings
  await fs.writeFile(p, content, 'utf8');
}

function optimizePairs(text, lang) {
  const lines = text.split(/\r?\n/);
  const uniq = new Set();
  const out = [];
  let total = 0, valid = 0, dup = 0, invalid = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    total++;
    const eq = line.indexOf('=');
    if (eq === -1) { invalid++; continue; }
    let left = line.slice(0, eq);
    let right = line.slice(eq + 1);
    left = normStr(left, { lower: true, mapYo: lang === 'russian' });
    right = normStr(right, { lower: true, mapYo: lang === 'russian' });
    if (!left || !right) { invalid++; continue; }
    const key = `${left}=${right}`;
    if (uniq.has(key)) { dup++; continue; }
    uniq.add(key);
    out.push(key);
    valid++;
  }

  // Sort by left, then right
  out.sort((a, b) => {
    const [al, ar] = a.split('=');
    const [bl, br] = b.split('=');
    return al.localeCompare(bl, lang === 'russian' ? 'ru' : 'en') || ar.localeCompare(br, lang === 'russian' ? 'ru' : 'en');
  });

  return { lines: out, stats: { total, valid, dup, invalid, unique: out.length } };
}

function optimizeChinese(text) {
  const lines = text.split(/\r?\n/);
  const uniq = new Set();
  const out = [];
  let total = 0, valid = 0, dup = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    total++;
    const token = normStr(line, { lower: false, mapYo: false });
    if (!token) continue;
    if (uniq.has(token)) { dup++; continue; }
    uniq.add(token);
    out.push(token);
    valid++;
  }

  // Deduplicate and sort lexicographically; keep stable for predictable diffs
  out.sort((a, b) => a.localeCompare(b, 'zh-Hans'));

  return { lines: out, stats: { total, valid, dup, unique: out.length } };
}

(async () => {
  const now = new Date().toISOString();

  const reports = [];

  // Russian
  const ruText = await readDict(FILES.russian);
  const ru = optimizePairs(ruText, 'russian');
  const ruHeader = `# Russian Lemmas (optimized ${now})\n# entries: ${ru.stats.unique} (from ${ru.stats.total}, dup=${ru.stats.dup}, invalid=${ru.stats.invalid})`;

  // English
  const enText = await readDict(FILES.english);
  const en = optimizePairs(enText, 'english');
  const enHeader = `# English Lemmas (optimized ${now})\n# entries: ${en.stats.unique} (from ${en.stats.total}, dup=${en.stats.dup}, invalid=${en.stats.invalid})`;

  // Chinese
  const zhText = await readDict(FILES.chinese);
  const zh = optimizeChinese(zhText);
  const zhHeader = `# Chinese Words (optimized ${now})\n# entries: ${zh.stats.unique} (from ${zh.stats.total}, dup=${zh.stats.dup})`;

  reports.push(`RU: unique=${ru.stats.unique} dup=${ru.stats.dup} invalid=${ru.stats.invalid}`);
  reports.push(`EN: unique=${en.stats.unique} dup=${en.stats.dup} invalid=${en.stats.invalid}`);
  reports.push(`ZH: unique=${zh.stats.unique} dup=${zh.stats.dup}`);

  if (ONLY_STATS) {
    console.log('[Dictionary stats]');
    for (const r of reports) console.log(' - ' + r);
    return;
  }

  await writeDict(FILES.russian, ru.lines, ruHeader);
  await writeDict(FILES.english, en.lines, enHeader);
  await writeDict(FILES.chinese, zh.lines, zhHeader);

  console.log('[Dictionary optimize] done');
  for (const r of reports) console.log(' - ' + r);
})();
