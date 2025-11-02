/* Minimal tests for Russian lemmatizer */
import { Lemmatizer } from "../src/lemmatizer";
import { DEFAULT_DICTIONARIES } from "../src/constants";

function assertEqual(actual: string, expected: string, msg: string) {
  if (actual !== expected) {
    throw new Error(`${msg}: expected "${expected}", got "${actual}"`);
  }
}

async function run() {
  const lem = new Lemmatizer();
  // Seed with default russian dictionary and enable advanced fallback
  lem.parseDictionary(DEFAULT_DICTIONARIES.russian);
  (lem as any).loaded = true;
  (lem as any).language = 'russian';
  lem.setOptions({ advancedFallback: true, allowParticipleToVerb: true });

  // Dictionary-driven cases
  assertEqual(lem.lemmatize('Красивые'), 'красивый', 'Adj plural → masc sg');
  assertEqual(lem.lemmatize('твоё'), 'твой', 'Dictionary pronoun variant');

  // Irregular plural → lemma
  assertEqual(lem.lemmatize('дети'), 'ребенок', 'Irregular дети');
  assertEqual(lem.lemmatize('детям'), 'ребенок', 'Irregular детям');
  assertEqual(lem.lemmatize('людей'), 'человек', 'Irregular людей');
  assertEqual(lem.lemmatize('друзья'), 'друг', 'Irregular друзья');
  assertEqual(lem.lemmatize('листья'), 'лист', 'Irregular листья');
  assertEqual(lem.lemmatize('деревья'), 'дерево', 'Irregular деревья');

  // Verb 3pl → infinitive
  assertEqual(lem.lemmatize('пишут'), 'писать', 'Verb 3pl пишут');
  assertEqual(lem.lemmatize('бегут'), 'бежать', 'Verb 3pl бегут');

  // Participles / gerunds → infinitive (enabled by allowParticipleToVerb)
  assertEqual(lem.lemmatize('прочитав'), 'прочитать', 'Gerund прочитав');
  assertEqual(lem.lemmatize('читающий'), 'читать', 'Participle читающий');

  // Hyphen: такой-то → такой
  assertEqual(lem.lemmatize('такой-то'), 'такой', 'Hyphen variant такой-то');

  // Numerals (partial): трёх → три
  assertEqual(lem.lemmatize('трёх'), 'три', 'Numeral трёх');

  // Adverbs / ё→е normalization via dictionary
  assertEqual(lem.lemmatize('быстро'), 'быстро', 'Adverb quickly stays');
  assertEqual(lem.lemmatize('назовёт'), 'назвать', 'Ё→Е normalization to match dictionary');

  console.log('✅ All lemma tests passed');
}

run().catch(err => {
  console.error('❌ Lemma tests failed:', err.message || err);
  process.exit(1);
});
