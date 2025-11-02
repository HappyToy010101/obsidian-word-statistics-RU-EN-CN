import fs from 'fs';
import path from 'path';

// Extract candidate irregular pairs from dictionaries/russian_lemmas.txt
// Heuristic: pick pairs with edit distance >= 3 and not a simple one-letter case ending drop.

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function main() {
  const dictPath = path.resolve(__dirname, '..', 'dictionaries', 'russian_lemmas.txt');
  if (!fs.existsSync(dictPath)) {
    console.error('Dictionary not found:', dictPath);
    process.exit(1);
  }
  const text = fs.readFileSync(dictPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const candidates: Array<{word: string, lemma: string, dist: number}> = [];

  for (const line of lines) {
    const s = line.trim();
    if (!s || s.startsWith('#')) continue;
    const [wf, lm] = s.split('=');
    if (!wf || !lm) continue;
    const word = wf.trim().toLowerCase();
    const lemma = lm.trim().toLowerCase();
    if (!word || !lemma || word === lemma) continue;

    // Skip trivial short stuff
    if (word.length <= 3 || lemma.length <= 2) continue;
    const dist = levenshtein(word, lemma);
    // Heuristic thresholds: very different forms are more likely to be irregular (e.g., дети→ребенок)
    if (dist >= 4) {
      candidates.push({ word, lemma, dist });
    }
  }

  candidates.sort((a, b) => b.dist - a.dist);
  const outPath = path.resolve(__dirname, '_irregular_suggestions.txt');
  const content = candidates.slice(0, 300).map(c => `${c.word}=${c.lemma}    # dist=${c.dist}`).join('\n');
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`Wrote ${Math.min(300, candidates.length)} suggestions to`, outPath);
}

main();
