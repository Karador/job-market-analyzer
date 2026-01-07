const { getAllVacancies } = require('../fetch/remoteJob.fetch');
const { saveVacancies } = require('../storage/vacancies.storage');
const { processRaw } = require('../model/processVacancies');

function getFetchDelay() {
  return process.env.NODE_ENV === 'production' ? 1000 : 0;
}

async function runFetch() {
  const raw = await getAllVacancies({ delay: getFetchDelay() });

  const scored = processRaw(raw);

  const saved = await saveVacancies(scored);
  console.log(`Сохранено новых вакансий: ${saved}`);
};

module.exports = { runFetch };
