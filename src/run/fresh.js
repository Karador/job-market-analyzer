const { getFreshVacancies } = require('../fetch/remoteJob.fetch');
const { normalizeVacancy } = require('../model/normalizeVacancy');
const { scoreVacancy } = require('../score/scoreVacancies');
const { explainVacancy } = require('../score/explain');

const { loadVacancies, saveVacancies } = require('../storage/vacancies.storage');
const { loadSeen, markSeen } = require('../storage/seen.storage');

async function runFresh({
  pages = 1,
  limit = 5,
} = {}) {
  const delay = process.env.NODE_ENV === 'production' ? 1000 : 0;

  // TODO: stop fetching when vacancy already exists in storage
  const raw = await getFreshVacancies({ pages, delay });

  if (!raw.length) {
    console.log('Свежих вакансий нет');
    return;
  }

  const freshScored = raw
    .map(normalizeVacancy)
    .map(scoreVacancy)
    .map(explainVacancy);

  const stored = await loadVacancies();
  const seen = loadSeen();

  const storedIds = new Set(
    stored.map(v => v.vacancy.id)
  );

  const candidates = freshScored
    .filter(v =>
      !storedIds.has(v.vacancy.id) &&
      !seen[v.vacancy.id] &&
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
    markSeen(candidates, 'remote-job');
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
