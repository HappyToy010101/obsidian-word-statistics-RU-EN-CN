import { ChineseSegmenter } from "../src/chineseSegmenter";
import { POEM_CONTENT, EXPECTED_STATS } from "../src/data/poem";

async function main() {
  // Mock plugin with settings similar to EnhancedTestSystem strict CN test
  const plugin: any = { settings: {
    chineseSegmentation: 'dictionary',
    chineseContextHeuristics: false,
    chineseAdjectivalHeuristics: false,
    minWordLength: 1,
    ignorePrepositions: false,
  }};

  const seg = new ChineseSegmenter(plugin);
  await seg.loadDictionary('chinese');
  const text = POEM_CONTENT.chinese;
  const tokens = seg.segment(text);

  // Count tokens
  const counts = new Map<string, number>();
  for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);

  const total = tokens.length;
  const unique = counts.size;
  const top = Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]).slice(0, 10);

  console.log({ total, unique, top });
  console.log('的:', counts.get('的') || 0, '名字:', counts.get('名字') || 0, '在:', counts.get('在') || 0);
}

main().catch(e=>{ console.error(e); process.exit(1); });
