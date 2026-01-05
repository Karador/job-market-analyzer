const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://remote-job.ru';

async function fetchHtml(path) {
  try {
    const response = await axios.get(`${BASE_URL}${path}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8'
      }
    });

    return response.data;
  } catch (error) {
    return null;
  }
}

async function getLastPage(path = '/') {
  const html = await fetchHtml(path);
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
  const html = await fetchHtml(path);
  if (!html) return null;

  const $ = cheerio.load(html);
  const vacancies = [];

  $('.vacancy_item').each((_, element) => {
    const anchor = $(element).find('a').first();
    const title = anchor.text().trim();
    const link = anchor.attr('href');

    if (!title || !link) {
        console.log(`link: ${link} title: ${title}`);
        return;
    }

    const company = $(element).find('small').next().text().trim();
    const description = ($(element).find('div').text().trim() + $(element).find('div').next().text()).replace(/\s+/g, " ").trim();

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
