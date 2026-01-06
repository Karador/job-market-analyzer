const { loadVacancies } = require('./storage/vacancies.storage');
const { markSeen, loadSeen } = require('./storage/seen.storage');
const { analyzePenalties } = require('./analysis/analyzePenalties');

const { runFetch } = require('./run/fetch');

const mode = process.argv[2] ?? 'fetch';

// scr/analysis/scoreStats.js
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

// scr/analysis/analyzePenalties.js
function scoreStatsPenalties(scored) {
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

// scr/analysis/penaltyStats.js
function penaltyStats(scored) {
  const values = scored.map(v => v.explain.softPenalty.penalty).sort((a, b) => a - b);

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

(async () => {
  // scored
  //   .sort((a, b) => b.scores.total - a.scores.total)
  //   .slice(0, 5)
  //   .forEach(v => {
  //     const values = [
  //       v.vacancy.meta.link,
  //       v.explain.baseTotal,
  //       v.explain.total,
  //       v.explain.softPenalty,
  //       v.explain.verdict,
  //       v.explain.notes,
  //       v.explain.contributions.groups,
  //       v.explain.contributions.entry,
  //       v.explain.contributions.quality,
  //     ];

  //     values.forEach(item => console.log(item));
  //   });

  switch (mode) {
    case 'fetch':
      await runFetch();
      break;
    case 'top':
      const vacancies = await loadVacancies();
      const seen = loadSeen();

      const top = vacancies
        .filter(v => v.explain.verdict !== 'reject' && !seen[v.vacancy.id])
        .sort((a, b) => b.scores.total - a.scores.total)
        .slice(0, 5);

      if (top.length) {
        markSeen(top, 'remote-job');
      };

      top.forEach(v => {
        console.log(v.vacancy.meta.link, v.scores.total);
      });

      // await runTop();
      break;
    case 'analyze':
      const scoredVacancies = await loadVacancies();
      console.log(scoreStats(scoredVacancies));

      console.log(penaltyStats(scoredVacancies));

      const analysis = analyzePenalties(scoredVacancies);

      console.dir(analysis, { depth: null });
      // await runAnalyze();
      break;
    default:
    // await runFresh();
  }
})();