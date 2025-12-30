const { getVacancies } = require('./getVacancies');

(async () => {
  const vacancies = await getVacancies();
  console.log(vacancies.slice(0, 5));
})();