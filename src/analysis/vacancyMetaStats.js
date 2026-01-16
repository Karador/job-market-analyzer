function vacancyMetaStats(scored) {
  const values = scored
    .map(v => v.scores.breakdown.metaContext.delta)
    .filter(v => typeof v === 'number')
    .sort((a, b) => a - b);

  if (!values.length) return null;

  const percentile = p =>
    values[Math.floor(values.length * p)];

  return {
    min: values[0],
    p10: percentile(0.1),
    p25: percentile(0.25),
    median: percentile(0.5),
    p75: percentile(0.75),
    p90: percentile(0.9),
    max: values[values.length - 1],
    avg: Number(
      values.reduce((a, b) => a + b, 0) / values.length
    ).toFixed(2)
  };
}

function metaSignalFrequency(scored) {
  const freq = {};

  for (const v of scored) {
    const signals = v.scores.breakdown.metaContext?.signals || [];
    for (const s of signals) {
      freq[s] = (freq[s] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1]);
}

function metaSignalImpact(scored) {
  const map = {};

  for (const v of scored) {
    const ctx = v.scores.breakdown.metaContext;
    if (!ctx) continue;

    for (const s of ctx.signals) {
      if (!map[s]) map[s] = { count: 0, sum: 0 };
      map[s].count += 1;
      map[s].sum += ctx.delta;
    }
  }

  return Object.entries(map)
    .map(([signal, v]) => ({
      signal,
      count: v.count,
      avgDelta: Number((v.sum / v.count).toFixed(3))
    }))
    .sort((a, b) => b.avgDelta - a.avgDelta);
}

function metaSignalsByRank(scored) {
  const result = {};

  for (const v of scored) {
    const rank = v.rank;
    const signals = v.scores.breakdown.metaContext?.signals || [];

    if (!result[rank]) result[rank] = {};
    for (const s of signals) {
      result[rank][s] = (result[rank][s] || 0) + 1;
    }
  }

  return result;
}

module.exports = { vacancyMetaStats, metaSignalFrequency, metaSignalImpact, metaSignalsByRank };