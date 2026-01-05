const cheerio = require('cheerio');

const { fetchHtml } = require('./fetchHTML');

const BASE_URL = 'https://remote-job.ru';

async function getLastPage(path = '/') {
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
      title,
      company,
      description,
      link: BASE_URL + link,
    });
  });

  return vacancies;
}

module.exports = { getVacancies, getLastPage };
