// Translate display text on a copy of a generated problem. The original remains
// Japanese so saved review problems and repeat-avoidance signatures stay stable.
const EXACT = {
  'たしざん': '加法', 'ひきざん': '减法', 'かけざん': '乘法', 'わりざん': '除法',
  '小数のたしざん': '小数加法', '小数のひきざん': '小数减法',
  '小数のかけざん': '小数乘法', '小数のわりざん': '小数除法',
  'いくつといくつ': '数的组成', '3つのかず': '三个数的计算', 'ぶんすう': '分数',
  'あまりのあるわりざん': '有余数的除法', '最大公約数': '最大公因数',
  '最小公倍数': '最小公倍数', 'けいさんのきまり': '运算顺序', 'がい数': '四舍五入',
  '百分率': '百分数', 'ひ': '比', 'xをもとめる': '求 x 的值', '約分': '约分',
  '分数のたしひき': '分数加减法', '分数と整数': '分数与整数',
  '分数のかけざん': '分数乘法', '分数のわりざん': '分数除法', '小数と分数': '小数与分数',
  '一の位': '个位', '十の位': '十位', '百の位': '百位', '千の位': '千位',
  '万の位': '万位', '十万の位': '十万位', '小数第一位': '十分位',
  '小数第二位': '百分位', '小数第三位': '千分位',
  'ひいた のこり': '相减后的余数', 'こたえ': '答案', '整数の部分': '整数部分',
  '分母': '分母', '分子': '分子', '商': '商', 'あまり': '余数',
  'どちらも わりきれる 数': '两个数的公因数', '分母どうし・分子どうしをかける': '分子相乘，分母相乘',
};

const PLACE = { '一': '个', '十': '十', '百': '百', '千': '千', '万': '万', '十万': '十万' };
const RULES = [
  [/^商の(.+)$/, (m, p) => `商的${EXACT[p] || p}`],
  [/^たす（(.+)）$/, (m, p) => `${EXACT[p] || p}相加`],
  [/^(\d+)の中に(\d+)はいくつ$/, (m, a, b) => `${a}里面有几个${b}`],
  [/^(\d+)のだん (.+)$/, (m, n, xs) => `${n}的倍数：${xs}`],
  [/^くりあがりの (\d+)$/, (m, n) => `进位的${n}`],
  [/^(\d+)をかける$/, (m, n) => `乘以${n}`],
  [/^(\d+)に いくつで (\d+)$/, (m, a, b) => `${a}加几等于${b}`],
  [/^(\d+)に (\d+)で 10$/, (m, a, b) => `${a}加${b}凑成10`],
  [/^(.+) の 10こぶん$/, (m, x) => `${x}的10倍`],
  [/^(\d+)を (\d+)つに わける$/, (m, a, b) => `把${a}平均分成${b}份`],
  [/^(.+) を 考える$/, (m, x) => `先计算${x}`],
  [/^(.+) と 同じ$/, (m, x) => `与${x}相同`],
  [/^(.+) と (.+)$/, (m, a, b) => `${a}和${b}`],
  [/^(\d+)のばいすう$/, (m, n) => `${n}的倍数`],
  [/^先に (.+)$/, (m, x) => `先算${x}`],
  [/^まず (.+)$/, (m, x) => `先算${x}`],
  [/^([一十百千万]+)の位を 四捨五入$/, (m, p) => `将${PLACE[p] || p}位四舍五入`],
  [/^(\d+)ばい$/, (m, n) => `${n}倍`],
  [/^(\d+)で わる$/, (m, n) => `除以${n}`],
  [/^分母は (\d+) のまま$/, (m, n) => `分母保持${n}不变`],
  [/^通分すると 分母は (\d+)$/, (m, n) => `通分后分母是${n}`],
  [/^分子に (\d+) をかける$/, (m, n) => `分子乘${n}`],
  [/^分母に (\d+) をかける$/, (m, n) => `分母乘${n}`],
  [/^(.+) を ひっくりかえして かける$/, (m, x) => `乘以${x}的倒数`],
];

function displayText(text) {
  if (typeof text !== 'string') return text;
  if (Object.hasOwn(EXACT, text)) return EXACT[text];
  for (const [pattern, replace] of RULES) if (pattern.test(text)) return text.replace(pattern, replace);
  return text;
}

function expressionText(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/ あまり /g, ' 余 ')
    .replace(/(\d+)は(\d+)と/g, '$1＝$2＋')
    .replace(/(\d+)を([十百千])の位までのがい数に/g, (m, n, place) => `${n}四舍五入到${place}位`)
    .replace(/(\d+)と(\d+)の最大公約数/g, '$1和$2的最大公因数')
    .replace(/(\d+)と(\d+)の最小公倍数/g, '$1和$2的最小公倍数')
    .replace(/(\d+)の(\d)/g, '$1的$2')
    .replace(/(^|[^\d])0と(?=\d+\/)/g, '$1')
    .replace(/(\d+)と(?=\d+\/)/g, '$1又');
}

function word(text) {
  const words = { 'は': '是', 'と': '和', 'の': '的', 'を': '约到', 'あまり': '余数',
    '最大公約数': '最大公因数', '最小公倍数': '最小公倍数',
    '十の位まで': '十位', '百の位まで': '百位', '千の位まで': '千位' };
  return words[text] ?? displayText(text);
}

export function localizeProblemZhCN(problem) {
  const p = structuredClone(problem);
  p.title = displayText(p.title);
  p.text = expressionText(p.text);
  p.answer = expressionText(p.answer);
  // Some prompts already contain an equals sign or only one side of a ratio;
  // appending another equals sign would turn the feedback into a false equation.
  if (problem.title === 'いくつといくつ') p.answerText = `${p.text}${p.answer}`;
  else if (problem.title === 'xをもとめる') p.answerText = `x ＝ ${p.answer}`;
  else if (problem.title === 'ひ') p.answerText = `答案：${p.answer}`;
  else p.answerText = `${p.text} ＝ ${p.answer}`;
  if (p.help) p.help = displayText(p.help);
  for (const cell of p.cells) if (cell.kind === 'word') cell.text = word(cell.text);
  for (const step of p.steps) {
    step.label = displayText(step.label);
    if (step.hint) step.hint = displayText(step.hint);
    if (step.help?.text) step.help.text = displayText(step.help.text);
  }
  return p;
}
