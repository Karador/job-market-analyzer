function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function analyzePenalties(scored) {
  const map = {};

  for (const v of scored) {
    const penalties = v.scores.softPenalty?.matched || [];
    const base = v.scores.baseTotal;
    const total = v.scores.total;
    const verdict = v.explain?.verdict ?? 'unknown';

    for (const p of penalties) {
      if (!map[p.phrase]) {
        map[p.phrase] = {
          count: 0,
          baseTotals: [],
          totals: [],
          verdicts: {
            accept: 0,
            review: 0,
            reject: 0,
            unknown: 0
          }
        };
      }

      const s = map[p.phrase];
      s.count++;
      s.baseTotals.push(base);
      s.totals.push(total);
      s.verdicts[verdict] = (s.verdicts[verdict] || 0) + 1;
    }
  }

  return Object.fromEntries(
    Object.entries(map)
      .map(([penalty, s]) => {
        const avgBase = avg(s.baseTotals);
        const avgTotal = avg(s.totals);

        return [
          penalty,
          {
            count: s.count,
            avgBase: Number(avgBase.toFixed(2)),
            avgTotal: Number(avgTotal.toFixed(2)),
            avgDelta: Number((avgTotal - avgBase).toFixed(2)),
            verdicts: s.verdicts
          }
        ];
      })
      .sort((a, b) => a[1].avgDelta - b[1].avgDelta)
  );
}

module.exports = { analyzePenalties };
