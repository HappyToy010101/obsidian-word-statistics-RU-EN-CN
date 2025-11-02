/* Minimal tests for Chinese segmenter */
import { ChineseSegmenter } from "../src/chineseSegmenter";
import { DEFAULT_DICTIONARIES } from "../src/constants";

function assertArr(actual: string[], expected: string[], msg: string) {
  const a = actual.join('|');
  const e = expected.join('|');
  if (a !== e) throw new Error(`${msg}: expected "${e}", got "${a}"`);
}

async function run() {
  const seg = new ChineseSegmenter();
  // Force dictionary mode for deterministic test
  (seg as any).plugin = { settings: { chineseSegmentation: 'dictionary', chineseContextHeuristics: true, chineseAdjectivalHeuristics: true } };
  await seg.loadDictionary('chinese');
  // Ensure certain words are recognized as single tokens
  (seg as any).plugin.settings.chineseCustomWords = ['时间','朋友'];
  (seg as any).applyCustomWords();

  // Basic segmentation from small default list
  assertArr(seg.segment('你的名字'), ['你的','名字'], 'Possessive + noun');
  assertArr(seg.segment('响亮的名字'), ['响亮','的','名字'], 'Adjective 的 + noun');

  // Context VO pair merge
  (seg as any).plugin.settings.chineseContextPairs = ['打电话'];
  seg.loadContextPairs();
  assertArr(seg.segment('打电话的时间'), ['打电话','的','时间'], 'VO pair merge, 的 split');

  // Pronoun plural merge
  assertArr(seg.segment('我们 的 朋友'.replace(/\s+/g,'')), ['我们的','朋友'], 'Pronoun plural + possessive');

  // Cache sanity: second call should return same output
  const first = seg.segment('你的名字');
  const second = seg.segment('你的名字');
  assertArr(first, second, 'Cache stable output');

  // Async external provider hook test (mock provider)
  seg.registerExternalProvider(async (text) => {
    if (text === '自定义词测试') return ['自定义词','测试'];
    return null;
  });
  const asyncOut = await seg.segmentAsync('自定义词测试');
  assertArr(asyncOut, ['自定义词','测试'], 'External provider segmentation');

  console.log('✅ All Chinese segmenter tests passed');
}

run().catch(err => { console.error('❌ Chinese tests failed:', err.message || err); process.exit(1); });
