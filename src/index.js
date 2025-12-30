const { getVacancies } = require('./getVacancies');

(async () => {
  const vacancies = await getVacancies();

  if (!vacancies) {

    console.log('failed to load data');

  } else {

    console.log(vacancies.slice(0, 5));
    
  }
})();