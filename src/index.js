const { getVacancies, getLastPage } = require('./getVacancies');
const { classifyVacancies } = require('./classifyVacancies');

async function loadVacanciesPage(path) {
  const vacancies = await getVacancies(path);

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
  return `/page/udalennaya-rabota-programmistom-vakansii?search[exactMatch]=0&search[query]=%D0%9F%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%81%D1%82&search[searchType]=vacancy&page=${page}`
}

(async () => {
  const vacancies = [];
  const startingPage = buildPath(1);

  const lastPage = await getLastPage(startingPage);
  console.log(lastPage);

  if (!lastPage) {
    console.log("Ошибка загрузки");
    return
  }

  for (let page = 1; page <= 5; page++) {
    const data = await loadVacanciesPage(buildPath(page));
    vacancies.push(...data);
    await sleep(1000);
  }

  for (const [group, filteredVacancies] of Object.entries(classifyVacancies(vacancies))) {
    console.log(`${group}: ${filteredVacancies.length}`)
  }
})();