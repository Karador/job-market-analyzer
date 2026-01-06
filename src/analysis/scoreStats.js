function scoreStats(scored) {
  const totals = scored.map(v => v.scores.total);

  const sorted = [...totals].sort((a, b) => a - b);

  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;

  const percentile = p =>
    sorted[Math.floor(sorted.length * p)];

  return {
    count: totals.length,
    min: sorted[0],
    p10: percentile(0.1),
    p25: percentile(0.25),
    median: percentile(0.5),
    p75: percentile(0.75),
    p90: percentile(0.9),
    max: sorted[sorted.length - 1],
    avg: Number(avg.toFixed(2))
  };
}

module.exports = { scoreStats };
