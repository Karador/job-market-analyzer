const { getAllVacancies } = require('../fetch/remoteJob.fetch');
const { normalizeVacancy } = require('../model/normalizeVacancy');
const { scoreVacancy } = require('../score/scoreVacancies');
const { explainVacancy } = require('../score/explain');
const { saveVacancies } = require('../storage/vacancies.storage');

function getFetchDelay() {
  return process.env.NODE_ENV === 'production' ? 1000 : 0;
}

async function runFetch() {
  const raw = await getAllVacancies({ delay: getFetchDelay() });

  const scored = raw
    .map(normalizeVacancy)
    .map(scoreVacancy)
    .map(explainVacancy);

  const saved = await saveVacancies(scored);
  console.log(`Сохранено новых вакансий: ${saved}`);
};

module.exports = { runFetch };
