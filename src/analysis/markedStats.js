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
    .match(/\b[a-zа-я0-9\.#+]+\b/gi) || []);
}

function markedStats(scoredVacancies) {
  const stats = {
    buckets: {
      top: [],
      good: [],
      mid: [],
      low: []
    }
  };

  for (const v of scoredVacancies) {
    const b = bucket(v.scores.total);
    stats.buckets[b].push(v);
  }

  const result = {};

  for (const [bucketName, items] of Object.entries(stats.buckets)) {
    const groupCounts = {};
    const penaltyCounts = {};
    const redFlags = {};
    const keywords = {};

    for (const item of items) {
      const text = item.vacancy.text;

      // task groups
      for (const [group, score] of Object.entries(item.scores.groups.scores)) {
        if (score > 0) inc(groupCounts, group);
      }

      // soft penalties
      for (const p of item.scores.softPenalty.matched) {
        inc(penaltyCounts, p.type);
      }

      // quality red flags
      for (const rf of item.scores.quality.redFlags) {
        inc(redFlags, rf);
      }

      // keywords
      for (const kw of extractKeywords(text)) {
        inc(keywords, kw);
      }
    }

    result[bucketName] = {
      count: items.length,
      taskGroups: groupCounts,
      softPenalties: penaltyCounts,
      redFlags,
      topKeywords: Object.entries(keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
    };
  }

  return result;
}

module.exports = { markedStats };
