function penaltyStats(scored) {
  const values = scored
    .map(v => v.scores.breakdown.softPenalty)
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

module.exports = { penaltyStats };
