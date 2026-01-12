function rankByQuantiles(scoredVacancies) {
  const values = scoredVacancies
    .map(v => v.scores.total)
    .sort((a, b) => a - b);

  const q = p => values[Math.floor(values.length * p)];

  const tTop = q(0.75);
  const tGood = q(0.5);
  const tMid = q(0.25);

  for (const v of scoredVacancies) {
    const s = v.scores.total;
    v.rank =
      s >= tTop ? 'top' :
      s >= tGood ? 'good' :
      s >= tMid ? 'mid' :
      'low';
  }

  return scoredVacancies;
}

module.exports = { rankByQuantiles };
