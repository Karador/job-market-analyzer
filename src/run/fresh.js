const { getFreshVacancies: getFreshRemoteJobVacancies } = require('../fetch/remoteJob.fetch');
const { getAllVacancies: getFreshHabrVacancies } = require('../fetch/habrCareer.fetch');
const { vacancyKey } = require('../utils/vacancyKey');
const { loadVacancies, saveVacancies } = require('../storage/vacancies.storage');
const { loadSeen, markSeen } = require('../storage/seen.storage');
const { processRaw } = require('../model/processVacancies');

async function runFresh({
  pages = 1,
  limit = 5,
} = {}) {
  const delay = process.env.NODE_ENV === 'production' ? 1000 : 0;

  // TODO: stop fetching when vacancy already exists in storage
  const [
    remoteRaw,
    habrRaw,
  ] = await Promise.all([
    getFreshRemoteJobVacancies({ pages, delay }),
    getFreshHabrVacancies({ pages, delay }),
  ]);

  const raw = [
    ...remoteRaw,
    ...habrRaw,
  ];

  if (!raw.length) {
    console.log('Свежих вакансий нет');
    return;
  }

  const freshScored = processRaw(raw);

  const bySource = freshScored.reduce((acc, v) => {
    const s = v.vacancy.meta.source;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  console.log('Fetched:', bySource);

  const stored = await loadVacancies();
  const seen = loadSeen();

  const storedKeys = new Set(
    stored.map(vacancyKey)
  );

  const candidates = freshScored
    .filter(v =>
      !storedKeys.has(vacancyKey(v)) &&
      !seen[vacancyKey(v)] &&
      v.explain.verdict !== 'reject'
    )
    .sort((a, b) => b.scores.total - a.scores.total)
    .slice(0, limit);

  if (!candidates.length) {
    console.log('Нет свежих подходящих вакансий');
    return;
  }

  await saveVacancies(freshScored);

  if (process.env.NODE_ENV === 'production') {
    markSeen(candidates);
  }

  candidates.forEach(v => {
    console.log(
      v.scores.total,
      v.vacancy.title,
      '\n',
      v.vacancy.meta.link,
      '\n',
    );
  });
}

module.exports = { runFresh };
