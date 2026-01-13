const { getAllVacancies: getRemoteVacancies } = require('../fetch/remoteJob.fetch');
const { getAllVacancies: getHabrVacancies } = require('../fetch/habrCareer.fetch');
const { getAllVacancies: getHHVacancies } = require('../fetch/hh.fetch');
const { saveVacancies } = require('../storage/vacancies.storage');
const { processRaw } = require('../model/processVacancies');

function getFetchDelay() {
  return process.env.NODE_ENV === 'production' ? 2000 : 0;
}

async function runFetch() {
  const delay = getFetchDelay();

  const [
    remoteRaw,
    habrRaw,
    hhRaw,
  ] = await Promise.all([
    getRemoteVacancies({ delay }),
    getHabrVacancies({ delay }),
    getHHVacancies({ delay: 2000 }),
  ]);

  const raw = [
    ...remoteRaw,
    ...habrRaw,
    ...hhRaw,
  ];

  const processed = processRaw(raw);

  const saved = await saveVacancies(processed);
  console.log(`Сохранено новых вакансий: ${saved}`);
}

module.exports = { runFetch };
