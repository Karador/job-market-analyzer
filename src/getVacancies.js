const axios = require('axios');
const cheerio = require('cheerio');

async function getVacancies() {
  const url = 'https://remote-job.ru/';
  const response = await axios.get(url);

  const html = response.data;
  const $ = cheerio.load(html);

  const vacancies = [];

  $('.vacancy-colored').each((_, element) => {
    const title = $(element).find('a').text().trim();
    const company = $(element).find('small:first').text().trim();
    const link = "https://remote-job.ru" + $(element).find('a').attr('href');

    vacancies.push({
      title,
      company,
      link
    });
  });

  return vacancies;
}

module.exports = { getVacancies };
