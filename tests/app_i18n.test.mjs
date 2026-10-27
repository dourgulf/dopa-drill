import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createI18n, resolveLocale, localizeProblem } from '../app/js/i18n.js';
import { SKILLS, LANES, skillName, laneName } from '../app/js/skills.js';
import { SKILL_NAMES_ZH_CN, LANE_NAMES_ZH_CN } from '../app/js/locales/skills-zh-CN.js';
import { STATIC_ZH_CN } from '../app/js/locales/static-zh-CN.js';

test('static Japanese page text and accessible labels have Chinese translations', () => {
  const source = readFileSync(new URL('../app/index.html', import.meta.url), 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<h1 id="logo"[\s\S]*?<\/h1>/, '') // The illustrated logo is localized separately.
    .replace(/<noscript>[\s\S]*?<\/noscript>/, '') // Already bilingual without JavaScript.
    .replace(/言語 \/ 语言/g, 'language'); // The selector label is intentionally bilingual.
  const candidates = [];
  for (const token of source.match(/<[^>]+>|[^<]+/g) || []) {
    if (token.startsWith('<')) {
      for (const match of token.matchAll(/(?:aria-label|content)="([^"]*)"/g)) candidates.push(match[1]);
    } else candidates.push(token.trim());
  }
  const nativeLanguageNames = new Set(['日本語', '简体中文']);
  const missing = [...new Set(candidates.filter((s) => /[\u3040-\u30ff\u3400-\u9fff]/.test(s) && !nativeLanguageNames.has(s) && !Object.hasOwn(STATIC_ZH_CN, s)))];
  assert.deepEqual(missing, []);
});

test('Chinese play instructions explain how extra mode is unlocked', () => {
  const instructions = STATIC_ZH_CN['基本の問題をすべて正解すると100点です。途中計算も含めた初回正解率が80%以上なら、時間制限付きのエクストラに進めます。まちがえた問題は「ふくしゅう」でやり直せます。'];
  assert.match(instructions, /所有步骤都首次答对/);
  assert.match(instructions, /题目达到80%/);
  assert.match(instructions, /复习模式除外/);
});

test('normalizes supported locale tags and falls back safely', () => {
  assert.equal(resolveLocale('ja-JP'), 'ja');
  assert.equal(resolveLocale('zh-Hans-CN'), 'zh-CN');
  assert.equal(resolveLocale('zh-CN'), 'zh-CN');
  assert.equal(resolveLocale('zh-CN-u-nu-hanidec'), 'zh-CN');
  assert.equal(resolveLocale('zh-SG'), 'zh-CN');
  assert.equal(resolveLocale('zh-TW'), 'ja');
  assert.equal(resolveLocale('zh-Hant-HK'), 'ja');
  assert.equal(resolveLocale(null), 'ja');
});

test('every skill and lane has a Chinese label without changing its identity', () => {
  assert.deepEqual(Object.keys(SKILL_NAMES_ZH_CN).sort(), SKILLS.map((s) => s.id).sort());
  assert.equal(LANE_NAMES_ZH_CN.length, LANES.length);
  for (const skill of SKILLS) {
    assert.ok(skillName(skill.id, 'zh-CN'));
    assert.equal(skillName(skill.id, 'ja'), skill.name);
  }
  for (let i = 0; i < LANES.length; i++) assert.ok(laneName(i, 'zh-CN'));
  assert.equal(skillName('unknown', 'zh-CN'), '');
});

test('Chinese skill names describe generated edge cases without overstating their operands', async () => {
  const { makeProblem, makeRng } = await import('../app/js/problems.js');
  const rng = makeRng(4821);
  const samples = (id) => Array.from({ length: 500 }, () => makeProblem(id, rng));
  assert.ok(samples('g1-add-2d1').some((p) => /^\d{2} \+ \d{2}$/.test(p.text)));
  assert.ok(samples('g1-sub-2d1').some((p) => /^\d{2} − \d{2}$/.test(p.text)));
  assert.ok(samples('g2-vadd3s').some((p) => p.answer === '100'));
  assert.ok(samples('g3-div-tens').some((p) => /^[1-9][1-9] ÷ \d$/.test(p.text)));
  assert.equal(skillName('g1-add-2d1', 'zh-CN'), '两位数加法');
  assert.equal(skillName('g1-sub-2d1', 'zh-CN'), '两位数减法');
  assert.equal(skillName('g2-vadd3s', 'zh-CN'), '进位到百的加法');
  assert.equal(skillName('g3-div-tens', 'zh-CN'), '两位数除以一位数');
});

test('looks up messages, interpolates parameters, and falls back to Japanese', () => {
  const i18n = createI18n({ ja: { welcome: 'こんにちは {name}', onlyJa: '日文' }, 'zh-CN': { welcome: '你好 {name}' } }, 'zh-CN');
  assert.equal(i18n.t('welcome', { name: '小明' }), '你好 小明');
  assert.equal(i18n.t('onlyJa'), '日文');
  assert.equal(i18n.t('unknown'), 'unknown');
  i18n.setLocale('ja');
  assert.equal(i18n.t('welcome', { name: '太郎' }), 'こんにちは 太郎');
});

test('Chinese problems preserve the generated answer, input steps, and original', async () => {
  const { makeProblem, makeRng, signature } = await import('../app/js/problems.js');
  const { localizeProblemZhCN } = await import('../app/js/locales/problems-zh-CN.js');
  const rng = makeRng(1042);
  for (const skill of SKILLS) for (let i = 0; i < 30; i++) {
    const original = makeProblem(skill.id, rng);
    const before = JSON.stringify(original);
    const translated = localizeProblemZhCN(original);
    assert.equal(JSON.stringify(original), before, skill.id);
    assert.deepEqual(translated.steps.map((s) => [s.cell, s.digit, s.after]), original.steps.map((s) => [s.cell, s.digit, s.after]), skill.id);
    assert.deepEqual(translated.cells.map(({ id, kind, r, c, rs, cs }) => [id, kind, r, c, rs, cs]), original.cells.map(({ id, kind, r, c, rs, cs }) => [id, kind, r, c, rs, cs]), skill.id);
    assert.deepEqual([translated.rows, translated.cols, translated.lines, translated.bracket], [original.rows, original.cols, original.lines, original.bracket], skill.id);
    for (const cell of translated.cells.filter((c) => c.kind === 'word')) {
      // The horizontal layout allocates one column per two word characters.
      assert.ok(cell.text.length <= 2 * (cell.cs || 1), `${skill.id}: ${cell.text} exceeds its ${cell.cs || 1} columns`);
    }
    assert.equal(signature(original), `${original.title}|${original.text}`);
    const visible = [translated.title, translated.text, translated.answer, translated.answerText, translated.help,
      ...translated.cells.filter((c) => c.kind === 'word').map((c) => c.text),
      ...translated.steps.flatMap((s) => [s.label, s.hint, s.help?.text])].filter(Boolean);
    assert.doesNotMatch(visible.join('\n'), /[\u3040-\u30ff]/, `${skill.id}: ${visible.join(' | ')}`);
  }
});

test('legacy vertical calculation templates retain their input layout in Chinese', async () => {
  const { BASIC_SETS, EXTRA_TIERS, generate, makeRng } = await import('../app/js/problems.js');
  const rng = makeRng(71);
  const templates = new Set([...Object.values(BASIC_SETS).flat(), ...EXTRA_TIERS.flat()]);
  for (const template of templates) {
    const original = generate(template, rng);
    const translated = localizeProblem(original, 'zh-CN');
    assert.deepEqual(translated.steps.map((s) => [s.cell, s.digit, s.after]), original.steps.map((s) => [s.cell, s.digit, s.after]), template);
    assert.doesNotMatch([translated.title, translated.answerText, ...translated.steps.map((s) => s.label)].join(' '), /[\u3040-\u30ff]/, template);
  }
});

test('Chinese composition answers form a complete equation', async () => {
  const { makeProblem, makeRng } = await import('../app/js/problems.js');
  const { localizeProblemZhCN } = await import('../app/js/locales/problems-zh-CN.js');
  const p = localizeProblemZhCN(makeProblem('g1-compose10', makeRng(3)));
  assert.match(p.answerText, /^10＝\d＋\d$/);
});

test('a saved review problem can be displayed in either language without changing its identity', async () => {
  const { makeProblem, makeRng, signature } = await import('../app/js/problems.js');
  const { reviewPlan } = await import('../app/js/session.js');
  const original = makeProblem('g1-compose10', makeRng(3));
  const saved = JSON.parse(JSON.stringify(original));
  const review = reviewPlan([{ skill: original.skill, problem: saved }]);
  const japanese = localizeProblem(review.items[0].problem, 'ja');
  const chinese = localizeProblem(review.items[0].problem, 'zh-CN');
  assert.equal(japanese.title, 'いくつといくつ');
  assert.equal(chinese.title, '数的组成');
  assert.equal(signature(review.items[0].problem), signature(original));
  assert.deepEqual(review.items[0].problem, original);
  assert.deepEqual(chinese.steps.map((step) => step.digit), original.steps.map((step) => step.digit));
});

test('all daily quest types have Chinese descriptions', async () => {
  const { QUESTS, DYNAMIC, questText } = await import('../app/js/quests.js');
  for (const quest of [...QUESTS, ...DYNAMIC]) {
    const q = { id: quest.id, skill: 'g1-add-nc' };
    const text = questText(q, 'zh-CN');
    assert.ok(text, quest.id);
    assert.doesNotMatch(text, /[\u3040-\u30ff]/, quest.id);
    assert.ok(questText(q, 'ja'), quest.id);
  }
});

test('Chinese quest descriptions match which answers advance progress', async () => {
  const { questText, questEvent } = await import('../app/js/quests.js');
  const polish = { id: 'polish', skill: 'g1-add-nc', goal: 3, prog: 0, done: false };
  const learning = { id: 'learn10', goal: 10, prog: 0, done: false };
  const state = { list: [polish, learning] };
  assert.match(questText(polish, 'zh-CN'), /首次答对3题/);
  assert.match(questText(learning, 'zh-CN'), /新技能或学习中技能/);
  questEvent(state, { type: 'solve', skill: polish.skill, skillState: 'new', firstTry: false });
  assert.equal(polish.prog, 0);
  assert.equal(learning.prog, 1);
  questEvent(state, { type: 'solve', skill: polish.skill, skillState: 'learning', firstTry: true });
  assert.equal(polish.prog, 1);
  assert.equal(learning.prog, 2);
});

test('every trophy series, trophy and collection item has Chinese display text', async () => {
  const tr = await import('../app/js/trophies.js');
  const ul = await import('../app/js/unlocks.js');
  const { TROPHY_CATEGORIES_ZH_CN, trophySeriesTitle, trophyText } = await import('../app/js/locales/trophies-zh-CN.js');
  const { CATEGORIES_ZH_CN, ITEMS_ZH_CN } = await import('../app/js/locales/collection-zh-CN.js');
  for (const cat of tr.CATS) assert.ok(TROPHY_CATEGORIES_ZH_CN[cat], cat);
  for (const series of tr.SERIES) {
    assert.ok(trophySeriesTitle(series), series.key);
    for (const trophy of series.items) {
      const text = trophyText(trophy);
      assert.ok(text && text[0] && text[1], trophy.id);
      assert.doesNotMatch(text.join(' '), /[\u3040-\u30ff]|undefined/, trophy.id);
    }
  }
  for (const cat of ul.CATS) assert.ok(CATEGORIES_ZH_CN[cat.key], cat.key);
  assert.deepEqual(Object.keys(ITEMS_ZH_CN).sort(), ul.ITEMS.map((it) => it.id).sort());
  for (const it of ul.ITEMS) assert.doesNotMatch(ITEMS_ZH_CN[it.id], /[\u3040-\u30ff]/, it.id);
});

test('Chinese streak trophy explains that bridged days do not count', async () => {
  const { TROPHY } = await import('../app/js/trophies.js');
  const { trophyText } = await import('../app/js/locales/trophies-zh-CN.js');
  const [name, description] = trophyText(TROPHY['streak-3']);
  assert.equal(name, '连续记录3天');
  assert.equal(description, '连续记录中练习3天，补签日不计入天数');
});

test('Chinese perfect trophy describes basic sets and excludes reviews', async () => {
  const { TROPHY } = await import('../app/js/trophies.js');
  const { trophyText } = await import('../app/js/locales/trophies-zh-CN.js');
  const { emptyStats, notePlay, noteSolve } = await import('../app/js/growth.js');
  const stats = emptyStats();
  notePlay(stats, { mode: 'review', firstRate: 1 });
  assert.equal(stats.perfects, 0);
  notePlay(stats, { mode: 'grade', firstRate: 1 });
  noteSolve(stats, { extra: true, firstTry: false, misses: 1 });
  assert.equal(stats.perfects, 1);
  assert.equal(trophyText(TROPHY['perfects-1'])[1], '完成1次基础题首次全对的练习，复习模式除外');
});

test('each next-star condition has a Chinese version with the same level', async () => {
  const { nextStar, STAR_RULE } = await import('../app/js/session.js');
  for (let stars = 1; stars <= 4; stars++) {
    const prog = { skills: { 'g1-add-nc': { mastered: true, stars, times: [], starDay: { 3: '2026-10-01' } } } };
    const ja = nextStar(prog, 'g1-add-nc', '2026-10-03');
    const cn = nextStar(prog, 'g1-add-nc', '2026-10-03', 'zh-CN');
    assert.equal(cn.n, ja.n);
    assert.doesNotMatch(`${cn.text} ${cn.now}`, /[\u3040-\u30ff]/);
    if (stars === 2) {
      assert.ok(cn.text.includes(`最近${STAR_RULE.speedN}题`));
      assert.ok(cn.text.includes(`至少${STAR_RULE.speedMin}题首次答对`));
      assert.ok(cn.text.includes('用时中位数不超过约每题'));
    }
    if (stars === 4) {
      assert.ok(cn.text.includes(`${STAR_RULE.top * 100}%`));
      assert.ok(cn.text.includes('用时中位数不超过约每题'));
    }
  }
});

test('Chinese star guidance follows retention and speed progress across days', async () => {
  const { emptyProgress, recordResult, starsOf, nextStar, baseMs } = await import('../app/js/session.js');
  const prog = emptyProgress();
  const id = 'g1-add-nc';
  const slow = baseMs(1, 1) * 1.5;
  const fast = baseMs(1, 1) * 0.5;
  const answer = (day, firstTry, ms) => recordResult(prog, id, firstTry, null, { day, ms, cells: 1 });
  for (let i = 0; i < 20; i++) answer('2026-10-01', true, slow);
  assert.equal(starsOf(prog, id), 2);
  for (let i = 0; i < 10; i++) answer('2026-10-01', true, fast);
  assert.equal(starsOf(prog, id), 3);
  assert.equal(nextStar(prog, id, '2026-10-07', 'zh-CN').now, '还需等待1天');
  for (let i = 0; i < 10; i++) answer('2026-10-07', true, slow);
  assert.equal(starsOf(prog, id), 3);
  assert.equal(nextStar(prog, id, '2026-10-08', 'zh-CN').now, '今天可以开始挑战');
  answer('2026-10-08', true, slow);
  answer('2026-10-08', false, slow);
  for (let i = 0; i < 2; i++) answer('2026-10-08', true, slow);
  assert.equal(starsOf(prog, id), 3);
  answer('2026-10-08', true, slow);
  assert.equal(starsOf(prog, id), 4);
  const fifth = nextStar(prog, id, '2026-10-08', 'zh-CN');
  assert.equal(fifth.n, 5);
  assert.match(fifth.text, /最近20题首次正确率达到95%/);
  assert.match(fifth.text, /用时中位数/);
  for (let i = 0; i < 20; i++) answer('2026-10-08', true, fast);
  assert.equal(starsOf(prog, id), 5);
  assert.equal(nextStar(prog, id, '2026-10-08', 'zh-CN'), null);
});

test('large score units use simplified Chinese without changing Japanese formatting', async () => {
  const { fmtDopa, unitOf, unitLabel } = await import('../app/js/scoring.js');
  assert.equal(fmtDopa(8, 'zh-CN'), '1.0亿');
  assert.equal(fmtDopa(8), '1.0億');
  assert.equal(unitLabel(unitOf(8), 'zh-CN'), '1亿');
  assert.equal(unitLabel(unitOf(8)), '1億');
});

test('Chinese display translates mixed fractions, remainders and rounding instructions', async () => {
  const { localizeProblemZhCN } = await import('../app/js/locales/problems-zh-CN.js');
  const make = (title, text, answer, words, hint) => ({ title, text, answer, cells: words.map((text) => ({ kind: 'word', text })), steps: [{ label: 'こたえ', digit: '1', cell: 'x', after: [], help: { ids: [], text: hint } }] });
  const mixed = localizeProblemZhCN(make('分数のたしひき', '2と1/3 + 1と1/3', '3と2/3', [], '分母は 3 のまま'));
  assert.equal(mixed.text, '2又1/3 + 1又1/3');
  assert.equal(mixed.answer, '3又2/3');
  assert.equal(mixed.steps[0].help.text, '分母保持3不变');
  const zeroWhole = localizeProblemZhCN(make('分数のたしひき', '2と1/3 + 0と1/3', '2と2/3', [], '分母は 3 のまま'));
  assert.equal(zeroWhole.answerText, '2又1/3 + 1/3 ＝ 2又2/3');
  const tenWhole = localizeProblemZhCN(make('分数のたしひき', '10と1/3 + 1/3', '10と2/3', [], ''));
  assert.equal(tenWhole.answerText, '10又1/3 + 1/3 ＝ 10又2/3');
  const rem = localizeProblemZhCN(make('あまりのあるわりざん', '20 ÷ 6', '3 あまり 2', ['あまり'], '6のだん 6 12 18 24'));
  assert.equal(rem.answerText, '20 ÷ 6 ＝ 3 余 2');
  assert.equal(rem.cells[0].text, '余数');
  assert.equal(rem.steps[0].help.text, '6的倍数：6 12 18 24');
  const round = localizeProblemZhCN(make('がい数', '40455を千の位までのがい数に', '40000', ['を', '千の位まで'], '百の位を 四捨五入'));
  assert.equal(round.title, '四舍五入');
  assert.equal(round.text, '40455四舍五入到千位');
  assert.equal(round.steps[0].help.text, '将百位四舍五入');
  assert.deepEqual(round.cells.map((c) => c.text), ['约到', '千位']);
});

test('ratio and unknown-value feedback does not form a false equation', async () => {
  const { makeProblem, makeRng } = await import('../app/js/problems.js');
  const rng = makeRng(944);
  for (let i = 0; i < 60; i++) {
    const ratio = localizeProblem(makeProblem('g6-ratio', rng), 'zh-CN');
    const letter = localizeProblem(makeProblem('g6-letter', rng), 'zh-CN');
    assert.equal(ratio.answerText, `答案：${ratio.answer}`);
    assert.equal(letter.answerText, `x ＝ ${letter.answer}`);
  }
});
