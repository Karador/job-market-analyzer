const cheerio = require('cheerio');
const { buildSearchPath } = require('./remoteJob.query');

const { fetchHtml } = require('./fetchHTML');

const BASE_URL = 'https://remote-job.ru';

async function getLastPage() {
  const path = buildSearchPath({ page: 1 });
  const html = await fetchHtml(BASE_URL + path);
  if (!html) return null;

  const $ = cheerio.load(html);

  const lastPage = Math.max(
    ...$('.pagination a')
      .map((_, el) => Number($(el).text()))
      .get()
      .filter(Boolean)
  );

  return lastPage;
}

async function getVacancies(path = '/') {
  const html = await fetchHtml(BASE_URL + path);
  if (!html) return null;

  const $ = cheerio.load(html);
  const vacancies = [];

  $('.vacancy_item').each((_, element) => {
    const anchor = $(element).find('a').first();
    const title = anchor.text();
    const link = anchor.attr('href');

    if (!title || !link) {
      console.log(`link: ${link} title: ${title}`);
      return;
    }

    const company = $(element).find('small').next().text();
    const description = $(element).find('div').first().text();

    vacancies.push({
      source: 'remote-job',
      title,
      company,
      description,
      link: BASE_URL + link,
    });
  });

  return vacancies;
}

async function loadVacanciesPage(page) {
  const path = buildSearchPath({ page });

  try {
    const vacancies = await getVacancies(path);
    console.log(`Remote-Job страница ${page}: ${vacancies.length} вакансий`);
    return vacancies;
  } catch {
    console.log(`Ошибка загрузки страницы ${page}`);
    return [];
  }
}

async function getFreshVacancies({ pages = 1, delay = 0 } = {}) {
  const result = [];

  for (let page = 1; page <= pages; page++) {
    const vacancies = await loadVacanciesPage(page);
    if (!vacancies?.length) break;

    result.push(...vacancies);

    if (delay) {
      await new Promise(r => setTimeout(r, delay));
    }
  }

  return result;
}

async function getAllVacancies({ delay = 0 } = {}) {
  const lastPage = await getLastPage();

  return getFreshVacancies({
    pages: lastPage,
    delay,
  });
}

module.exports = { getFreshVacancies, getAllVacancies };
