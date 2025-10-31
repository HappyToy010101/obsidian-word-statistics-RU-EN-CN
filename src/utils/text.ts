// @ts-nocheck

/**
 * Filters words by min length and applies a lemmatizer function.
 * Keeps only lemmas that meet min length as well.
 */
export function filterAndLemmatize(words: string[] = [], minLength: number, lemmatize: (w: string) => string): string[] {
  const out: string[] = [];
  if (!Array.isArray(words) || !lemmatize || typeof minLength !== 'number') return out;
  const min = Math.max(1, minLength | 0);
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (!w || typeof w !== 'string') continue;
    if (w.length < min) continue;
    const lemma = lemmatize(w);
    if (lemma && lemma.length >= min) out.push(lemma);
  }
  return out;
}
