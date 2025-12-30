const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://remote-job.ru';
const START_PAGE = '/';

async function fetchHtml(path) {
  try {
    const response = await axios.get(`${BASE_URL}${path}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки:', path);
    return null;
  }
}

async function getVacancies() {
  const html = await fetchHtml(START_PAGE);

  if (!html) {
    return null
  }

  const $ = cheerio.load(html);

  const vacancies = [];

  $('.vacancy-colored').each((_, element) => {
    const title = $(element).find('a').first().text().trim();
    const company = $(element).find('small').first().text().trim();
    const link = $(element).find('a').first().attr('href');

    if (!title || !link) {
        return;
    }

    vacancies.push({
      title,
      company,
      link: BASE_URL + link,
    });
  });

  return vacancies;
}

module.exports = { getVacancies };
