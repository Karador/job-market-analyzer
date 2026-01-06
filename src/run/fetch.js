const remoteJob = require('../fetch/remoteJob.fetch');
const { normalizeVacancy } = require('../model/normalizeVacancy');
const { scoreVacancy } = require('../score/scoreVacancies');
const { explainVacancy } = require('../score/explain');
const { saveVacancies } = require('../storage/vacancies.storage');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildPath(page) {
  return `/search?search%5BexactMatch%5D=0&search%5B
            query%5D=%D0%9F%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%81%D1%82&
            search%5BsearchType%5D=vacancy&
            alias=udalennaya-rabota-programmistom-vakansii&
            page=${page}&
            period=4`;
}

async function loadVacanciesPage(page) {
  const path = buildPath(page);

  try {
    const vacancies = await remoteJob.getVacancies(path);
    console.log(`Страница ${page}: ${vacancies.length} вакансий`);
    return vacancies;
  } catch {
    console.log(`Ошибка загрузки страницы ${page}`);
    return [];
  }
}

async function runFetch() {
  const startPath = buildPath(1);
  const lastPage = await remoteJob.getLastPage(startPath);

  if (!lastPage) {
    console.log('Не удалось определить последнюю страницу');
    return;
  }

  const raw = [];

  for (let page = 1; page <= lastPage; page++) {
    raw.push(...await loadVacanciesPage(page));
    await sleep(1000);
  }

  const scored = raw
    .map(normalizeVacancy)
    .map(scoreVacancy)
    .map(explainVacancy);

  const saved = await saveVacancies(scored);
  console.log(`Сохранено новых вакансий: ${saved}`);
};

module.exports = { runFetch };
