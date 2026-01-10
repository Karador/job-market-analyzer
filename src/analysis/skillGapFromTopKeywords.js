function bucket(score) {
  if (score >= 0.5) return 'top';
  if (score >= 0.3) return 'good';
  if (score >= 0.2) return 'mid';
  return 'low';
}

function inc(map, key, by = 1) {
  map[key] = (map[key] || 0) + by;
}

function extractKeywords(text) {
  return (text
    .toLowerCase()
    .match(/\b[a-zа-я][a-zа-я0-9\.\+#\-]{1,}\b/gi) || []);
}

// простая фильтрация мусора — можно расширять
function isMeaningfulKeyword(kw) {
  return !(
    kw.length < 3 ||
    ['and', 'the', 'for', 'with', 'you', 'your', 'web'].includes(kw)
  );
}

function skillGapFromTopKeywords(scoredVacancies, options = {}) {
  const {
    topLimit = 30,
    minTopShare = 0.2
  } = options;

  const buckets = {
    top: [],
    other: []
  };

  for (const v of scoredVacancies) {
    const b = bucket(v.scores.total);
    if (b === 'top') buckets.top.push(v);
    else buckets.other.push(v);
  }

  const topCounts = {};
  const otherCounts = {};

  for (const v of buckets.top) {
    const text = v.vacancy.text || '';
    for (const kw of extractKeywords(text)) {
      if (!isMeaningfulKeyword(kw)) continue;
      inc(topCounts, kw);
    }
  }

  for (const v of buckets.other) {
    const text = v.vacancy.text || '';
    for (const kw of extractKeywords(text)) {
      if (!isMeaningfulKeyword(kw)) continue;
      inc(otherCounts, kw);
    }
  }

  const topTotal = buckets.top.length;
  const otherTotal = buckets.other.length;

  const gaps = [];

  for (const [kw, topCount] of Object.entries(topCounts)) {
    const topShare = topCount / topTotal;
    if (topShare < minTopShare) continue;

    const otherShare = otherCounts[kw]
      ? otherCounts[kw] / otherTotal
      : 0;

    gaps.push({
      keyword: kw,
      topShare: Number(topShare.toFixed(2)),
      otherShare: Number(otherShare.toFixed(2)),
      delta: Number((topShare - otherShare).toFixed(2))
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
