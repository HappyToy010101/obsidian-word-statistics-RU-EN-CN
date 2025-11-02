import fs from 'fs';
import path from 'path';
import readline from 'readline';

type Pair = { word: string; lemma: string; note?: string };

function readPairsFromFile(p: string): Pair[] {
  if (!fs.existsSync(p)) return [];
  const txt = fs.readFileSync(p, 'utf8');
  const res: Pair[] = [];
  for (const line of txt.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith('#')) continue;
    const [lhs, rhsPart] = s.split('=');
    if (!lhs || !rhsPart) continue;
    const [rhs, ...rest] = rhsPart.split('#');
    const word = lhs.trim().toLowerCase();
    const lemma = (rhs || '').trim().toLowerCase();
    const note = rest.join('#').trim();
    if (word && lemma) res.push({ word, lemma, note });
  }
  return res;
}

function readMapFromDict(p: string): Map<string, string> {
  const m = new Map<string, string>();
  for (const { word, lemma } of readPairsFromFile(p)) m.set(word, lemma);
  return m;
}

function isCyrillic(s: string): boolean {
  return /^[\p{sc=Cyrillic}\-]+$/u.test(s);
}

function parseArgs(argv: string[]) {
  const args: Record<string, any> = { minDist: 4, limit: 300, dryRun: false, interactive: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--min-dist' || a === '--threshold') { args.minDist = parseInt(argv[++i] || '4', 10) || 4; }
    else if (a === '--limit') { args.limit = parseInt(argv[++i] || '300', 10) || 300; }
    else if (a === '--dry-run') { args.dryRun = true; }
    else if (a === '--interactive' || a === '-i') { args.interactive = true; }
    else if (a === '--suggestions') { args.suggestions = argv[++i]; }
    else if (a === '--out') { args.out = argv[++i]; }
  }
  return args;
}

async function promptInteractive(pairs: Array<{word:string, lemma:string, dist:number}>, limit: number): Promise<Array<{word:string, lemma:string}>> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q: string) => new Promise<string>(res => rl.question(q, (ans) => res(ans.trim().toLowerCase())));
  const accepted: Array<{word:string, lemma:string}> = [];
  let acceptAll = false;
  try {
    for (const item of pairs) {
      if (limit && accepted.length >= limit) break;
      if (acceptAll) { accepted.push({ word: item.word, lemma: item.lemma }); continue; }
      const msg = `${item.word} = ${item.lemma}  (dist=${item.dist})  [y]es/[n]o/[a]ll/[q]uit: `;
      const ans = await ask(msg);
      if (ans === 'y' || ans === 'yes' || ans === '') { accepted.push({ word: item.word, lemma: item.lemma }); }
      else if (ans === 'a' || ans === 'all') { accepted.push({ word: item.word, lemma: item.lemma }); acceptAll = true; }
      else if (ans === 'q' || ans === 'quit') { break; }
      // 'n' or anything else → skip
    }
  } finally { rl.close(); }
  return accepted;
}

async function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(__dirname, '..');
  const dictDir = path.resolve(repoRoot, 'dictionaries');
  const defaultDictPath = path.join(dictDir, 'russian_lemmas.txt');
  const customOutPath = args.out ? path.resolve(repoRoot, args.out) : path.join(dictDir, 'custom_russian_lemmas.txt');
  const suggestionsPath = args.suggestions ? path.resolve(repoRoot, args.suggestions) : path.resolve(__dirname, '_irregular_suggestions.txt');

  if (!fs.existsSync(defaultDictPath)) {
    console.error('Missing dictionary:', defaultDictPath);
    process.exit(1);
  }

  // Load default dictionary map and existing custom entries
  const defaultMap = readMapFromDict(defaultDictPath);
  const existingCustom = readPairsFromFile(customOutPath);
  const customMap = new Map<string, string>();
  for (const p of existingCustom) customMap.set(p.word, p.lemma);

  if (!fs.existsSync(suggestionsPath)) {
    console.error('Missing suggestions file:', suggestionsPath);
    console.error('Run: npm run dict:irregulars');
    process.exit(1);
  }
  const suggestionsRaw = fs.readFileSync(suggestionsPath, 'utf8').split(/\r?\n/);
  // parse suggestions of form word=lemma  # dist=10 (accept both formats)
  const suggestions = suggestionsRaw.map(line => {
    const s = line.trim();
    if (!s || s.startsWith('#')) return null;
    const main = s.split('#')[0].trim();
    const [wf, lm] = main.split('=');
    if (!wf || !lm) return null;
    return { word: wf.trim(), lemma: lm.trim() } as Pair;
  }).filter(Boolean) as Pair[];

  // Filters: only Cyrillic tokens, skip if default dict already maps to a different lemma
  const filtered: Pair[] = [];
  for (const s of suggestions) {
    const w = s.word.toLowerCase();
    const l = s.lemma.toLowerCase();
    if (!isCyrillic(w) || !isCyrillic(l)) continue;
    const inDefault = defaultMap.get(w);
    if (inDefault && inDefault !== l) continue; // conflicting suggestion → skip
    if (customMap.get(w) === l) continue; // already present
    // Skip very short forms and identical pairs
    if (w.length <= 2 || l.length <= 2 || w === l) continue;
    filtered.push({ word: w, lemma: l });
  }

  if (filtered.length === 0) {
    console.log('No new candidates to add.');
    process.exit(0);
  }

  // Optional interactive moderation or limit
  let moderated: Pair[] = filtered;
  if (args.interactive || args.limit) {
    const limited = (args.limit && args.limit > 0) ? filtered.slice(0, args.limit) : filtered;
    if (args.interactive) {
      const withDist = limited.map(p => ({ word: p.word, lemma: p.lemma, dist: 0 }));
      const selected = await promptInteractive(withDist, args.limit || 0);
      moderated = selected.map(s => ({ word: s.word, lemma: s.lemma }));
    } else {
      moderated = limited;
    }
  }

  if (args.dryRun) {
    console.log(`Dry-run: would add ${moderated.length} entries to ${customOutPath}`);
    console.log(moderated.slice(0, 20).map(p => `${p.word}=${p.lemma}`).join('\n'));
    process.exit(0);
  }

  // Merge: keep existing custom lines, append moderated unique sorted by word
  const newMap = new Map<string, string>(customMap);
  for (const p of moderated) {
    if (!newMap.has(p.word)) newMap.set(p.word, p.lemma);
  }

  const outLines: string[] = [];
  outLines.push('# Custom Russian lemmas (generated)');
  outLines.push(`# Generated at ${new Date().toISOString()}`);
  outLines.push('# Format: wordform=lemma');
  outLines.push('');

  // Preserve existing entries first (in original order)
  for (const p of existingCustom) {
    outLines.push(`${p.word}=${p.lemma}`);
  }

  // Append new ones not already present
  const existingSet = new Set(existingCustom.map(p => `${p.word}=${p.lemma}`));
  const additions: string[] = [];
  const sorted = Array.from(newMap.entries()).sort((a, b) => a[0].localeCompare(b[0], 'ru'));
  for (const [w, l] of sorted) {
    const line = `${w}=${l}`;
    if (!existingSet.has(line)) additions.push(line);
  }
  if (additions.length) {
    outLines.push('');
    outLines.push('# ---- Auto additions below ----');
    outLines.push(...additions);
  }

  fs.writeFileSync(customOutPath, outLines.join('\n'), 'utf8');
  console.log(`Wrote ${additions.length} new entries to`, customOutPath);
  console.log('Tip: copy this file into your vault at .obsidian/plugins/word-statistics-ru-en-cn/dictionaries/custom_russian_lemmas.txt');
}

main();
