function inc(map, key, by = 1) {
  map[key] = (map[key] || 0) + by;
}

function extractKeywords(text) {
  return (
    text
      .toLowerCase()
      .match(/\b[a-zа-я][a-zа-я0-9\.\+#\-]{1,}\b/gi) || []
  );
}

const ROLE_NOISE = new Set([
  'frontend',
  'backend',
  'developer',
  'development',
  'engineer',
  'web',
  'fullstack',
  'full-stack',
  'middle',
  'senior',
  'junior',
  'git',
  'api',
  'between1and3',
  'between3and6',
]);

const STOP_WORDS = new Set([
  'and',
  'the',
  'for',
  'with',
  'you',
  'your',
  'our',
  'from',
  'will'
]);

function isMeaningfulKeyword(kw) {
  if (kw.length < 3) return false;
  if (STOP_WORDS.has(kw)) return false;
  if (ROLE_NOISE.has(kw)) return false;
  return true;
}

const TECH_ALIASES = {
  'js': 'javascript',
  'node': 'nodejs',
  'node.js': 'nodejs',
  'reactjs': 'react.web',
  'react.js': 'react.web',
  'react': 'react.web',
  'vuejs': 'vue',
  'vue.js': 'vue',
  'ts': 'typescript',
  'next': 'next.js',
};

function normalizeKeyword(kw) {
  return TECH_ALIASES[kw] || kw;
}

function skillGapFromTopKeywords(scoredVacancies, options = {}) {
  const {
    topLimit = 20,
    minTopShare = 0.15
  } = options;

  const buckets = { top: [], other: [] };

  for (const v of scoredVacancies) {
    const b = v.rank;
    if (b === 'top') buckets.top.push(v);
    else buckets.other.push(v);
  }

  const topCounts = {};
  const otherCounts = {};

  function collect(vacancies, target) {
    for (const v of vacancies) {
      const tech = v.vacancy.tech?.technologies || {};
      const text = v.vacancy.text || '';

      for (let kw of extractKeywords(text)) {
        if (!isMeaningfulKeyword(kw)) continue;
        kw = normalizeKeyword(kw);
        if (!tech[kw]) {
          inc(target, kw);
        }
      }

      for (const key of Object.keys(tech)) {
        inc(target, key);
      }
    }
  }

  collect(buckets.top, topCounts);
  collect(buckets.other, otherCounts);

  const topTotal = buckets.top.length;
  const otherTotal = buckets.other.length;

  const gaps = [];

  for (const [kw, topCount] of Object.entries(topCounts)) {
    const topShare = topCount / topTotal;
    if (topShare < minTopShare) continue;

    const otherShare = otherCounts[kw]
      ? otherCounts[kw] / otherTotal
      : 0;

    const delta = topShare - otherShare;
    if (delta <= 0) continue;

    gaps.push({
      keyword: kw,
      topShare: Number(topShare.toFixed(2)),
      otherShare: Number(otherShare.toFixed(2)),
      delta: Number(delta.toFixed(2))
    });
  }

  gaps.sort((a, b) => b.delta - a.delta);

  return {
    summary: {
      topVacancies: topTotal,
      otherVacancies: otherTotal,
      analyzedKeywords: gaps.length
    },
    prioritySkills: gaps.slice(0, topLimit)
  };
}

module.exports = { skillGapFromTopKeywords };
