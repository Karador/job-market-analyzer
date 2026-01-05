const remoteJob = require('./fetch/remoteJob.fetch');
const { normalizeVacancy } = require('./model/normalizeVacancy');
const { scoreVacancy } = require('./score/scoreVacancies');

async function loadVacanciesPage(path) {
  const vacancies = await remoteJob.getVacancies(path);

  if (!vacancies) {

    console.log('Страница не загрузилась');
    return [];

  }

  console.log(`Найдено вакансий: ${vacancies.length}`);
  return vacancies;

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildPath(page) {
  return `/search?search%5BexactMatch%5D=0&search%5Bquery%5D=%D0%9F%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%81%D1%82&search%5BsearchType%5D=vacancy&alias=udalennaya-rabota-programmistom-vakansii&page=${page}&period=4`
}

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
  const rawVacancies = [];
  const startingPage = buildPath(1);

  const lastPage = await remoteJob.getLastPage(startingPage);
  console.log(lastPage);

  if (!lastPage) {
    console.log("Ошибка загрузки");
    return
  }

  for (let page = 1; page <= lastPage; page++) {
    const data = await loadVacanciesPage(buildPath(page));
    rawVacancies.push(...data);
    await sleep(1000);
  }

  const scored = rawVacancies.map(normalizeVacancy).map(scoreVacancy);

  console.log(scoreStats(scored));

  console.log(penaltyStats(scored));

  // scored
  //   .sort((a, b) => b.scores.total - a.scores.total)
  //   .slice(0, 5)
  //   .forEach(v => {
  //     const values = [
  //       v.vacancy.link,
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
})();