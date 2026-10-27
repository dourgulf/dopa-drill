import { LANE_NAMES_ZH_CN } from './skills-zh-CN.js';

export const TROPHY_CATEGORIES_ZH_CN = {
  'つづける': '坚持', 'たくさん': '积累', 'スキル': '技能', 'せいちょう': '成长',
  'エクストラ': '加练', 'コンボ': '连击', 'せいかく': '准确', 'ドパ': '多巴',
  'ふくしゅう': '复习', 'がくねん': '年级', 'コレクション': '收藏', 'ひみつ': '秘密',
};
const SERIES_ZH_CN = {
  streak: '连续练习', days: '练习天数', stickers: '登录贴纸', crowns: '皇冠贴纸',
  problems: '解答的题目', cells: '输入的数字', plays: '练习次数', minutes: '练习时间',
  unlocked: '解锁技能', mastered: '掌握技能', gradeDone: '掌握全年级', laneDone: '掌握技能分类',
  extras: '进入加练', extraBest: '单次加练最高题数', extraSolved: '加练解题数', combo: '连击',
  perfects: '基础题首次全对', firstTry: '首次答对', dopa: '多巴', review: '复习', secret: '秘密',
  questDays: '完成全部任务', questRun: '连续完成任务', hammer: '补签锤', starsTotal: '星星总数',
  star5: '五星技能', gradeStar3: '全年级三星', polished: '复习生疏技能', capsules: '时间胶囊',
  capsuleFaster: '比以前更快', grew: '进步了', items: '收藏', catComplete: '集齐收藏',
};
export function trophySeriesTitle(series) {
  if (/^grade[1-6]$/.test(series.key)) return `${series.key.slice(-1)}年级练习`;
  return SERIES_ZH_CN[series.key];
}
const SECRET = {
  'secret-perfect14': ['14题全对', '14道题全部答对且没有输错'],
  'secret-extraClean': ['加练零失误', '加练中答对至少5题且没有输错'],
  'secret-sunday': ['星期日的数学', '在星期日玩游戏'],
  'secret-newyear': ['新年练习', '在1月1日玩游戏'],
  'secret-comeback': ['欢迎回来！', '间隔至少一周后再次练习'],
  'secret-allmodes': ['所有玩法', '体验我的水平、按年级、练习和复习四种模式'],
};
const DOPA = { 2: '100', 3: '1000', 4: '1万', 5: '10万', 6: '100万', 7: '1000万', 8: '1亿', 9: '10亿' };
export function trophyText(t) {
  const v = t.need;
  const n = Number(v).toLocaleString('zh-CN');
  if (t.series === 'secret') return SECRET[t.id];
  if (t.series === 'gradeDone' || t.series === 'gradeStar3') {
    const g = t.id.split('-').at(-1);
    return t.series === 'gradeDone' ? [`${g}年级全部掌握`, `掌握${g}年级的全部技能`] : [`${g}年级全部三星`, `将${g}年级的全部技能提升到至少三星`];
  }
  if (t.series === 'laneDone') {
    const lane = LANE_NAMES_ZH_CN[Number(t.id.split('-').at(-1))];
    return [`掌握${lane}`, `掌握“${lane}”的全部技能`];
  }
  if (/^grade[1-6]$/.test(t.series)) {
    const g = t.series.slice(-1);
    return [`${g}年级 ${n}次`, `在${g}年级模式中玩${n}次`];
  }
  const text = {
    streak: [`连续记录${n}天`, `连续记录中练习${n}天，补签日不计入天数`], days: [`练习${n}天`, `累计练习${n}天`],
    stickers: [`${n}张贴纸`, `收集${n}张登录奖励贴纸`], crowns: [`${n}顶皇冠`, `收集${n}张第7天的皇冠贴纸`],
    problems: [`解答${n}题`, `累计解答${n}题`], cells: [`输入${n}位`, `累计输入${n}位正确数字`],
    plays: [`练习${n}次`, `完成${n}次练习`], minutes: [`累计${n}分钟`, `累计练习${n}分钟`],
    unlocked: [`解锁${n}项`, `解锁${n}项技能`], mastered: [`掌握${n}项`, `掌握${n}项技能`],
    extras: [`加练${n}次`, `进入加练${n}次`], extraBest: [`单次${n}题`, `一次加练中解答${n}题`],
    extraSolved: [`加练${n}题`, `在加练中累计解答${n}题`], combo: [`${n}连击`, `达成${n}连击`],
    perfects: [`基础题首次全对${n}次`, `完成${n}次基础题首次全对的练习，复习模式除外`], firstTry: [`首次答对${n}题`, `累计首次答对${n}题`],
    dopa: [`${DOPA[v]}多巴`, `单次练习中多巴达到${DOPA[v]}`], review: [`复习${n}题`, `重做${n}道错题`],
    questDays: [`全部完成${n}天`, `累计${n}天完成所有每日任务`], questRun: [`连续${n}天完成任务`, `连续${n}天完成所有每日任务`],
    hammer: [v === 1 ? '第一次补签' : `补签${n}次`, `使用补签锤${n}次`],
    starsTotal: [`${n}颗星`, `累计获得${n}颗技能星星`], star5: [`${n}项五星技能`, `将${n}项技能提升到五星`],
    polished: [`复习${n}次`, `复习生疏技能${n}次`], capsules: [`${n}个胶囊`, `打开${n}个时间胶囊`],
    capsuleFaster: [`比以前快${n}次`, `在时间胶囊中比以前更快答对${n}次`], grew: [`进步${n}次`, `结果页显示“进步了”${n}次`],
    items: [`收藏${n}件`, `收集${n}件收藏品`], catComplete: [`集齐${n}类`, `集齐${n}类收藏品`],
  };
  return text[t.series];
}
