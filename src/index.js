const { getVacancies, getLastPage } = require('./getVacancies');
const { scoreVacancies } = require('./scoreVacancies');

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
  return `/search?search%5BexactMatch%5D=0&search%5Bquery%5D=%D0%9F%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%81%D1%82&search%5BsearchType%5D=vacancy&alias=udalennaya-rabota-programmistom-vakansii&page=${page}&period=4`
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

  for (let page = 1; page <= lastPage; page++) {
    const data = await loadVacanciesPage(buildPath(page));
    vacancies.push(...data);
    await sleep(1000);
  }

  const scored = scoreVacancies(vacancies);

  scored
    .sort((a, b) => b.scores.total - a.scores.total)
    .slice(0, 10)
    .forEach(v => {
      const values = [
        v.vacancy.link,
        v.explain.total,
        v.explain.verdict,
        v.explain.notes,
        v.explain.contributions.groups,
        v.explain.contributions.entry,
        v.explain.contributions.quality,
      ];

      values.forEach(item => console.log(item));
    });
})();