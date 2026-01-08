const cheerio = require('cheerio');
const { buildVacanciesPath } = require('./habrCareer.query');
const { fetchHtml } = require('./fetchHTML');

const BASE_URL = 'https://career.habr.com';

/**
 * Парсинг мета-информации (опыт, удалёнка, занятость)
 */
function parseMeta($, $card) {
  const meta = {};

  $card.find('.vacancy-meta .basic-chip').each((_, chip) => {
    const text = $(chip)
      .find('.chip-with-icon__text')
      .text()
      .trim();

    if (!text) return;

    if (['Junior', 'Middle', 'Senior', 'Lead'].includes(text)) {
      meta.experience = text;
      return;
    }

    if (text.toLowerCase().includes('удал')) {
      meta.remote = true;
      return;
    }

    if (text.includes('Неполный')) {
      meta.employment = 'part_time';
      return;
    }

    if (text.includes('Полный')) {
      meta.employment = 'full_time';
    }
  });

  return meta;
}

/**
 * Парсинг HTML страницы вакансий
 */
function parseVacancies(html) {
  if (!html) return [];

  const $ = cheerio.load(html);
  const result = [];

  $('.vacancy-card').each((_, el) => {
    const $card = $(el);

    const titleLink = $card
      .find('.vacancy-card__title-link')
      .first();

    const relativeLink = titleLink.attr('href');
    if (!relativeLink) return;

    // ID достаём из ссылки — самый устойчивый вариант
    const idMatch = relativeLink.match(/\/vacancies\/(\d+)/);
    const id = idMatch ? idMatch[1] : null;
    if (!id) return;

    const title = titleLink.text().trim();

    const link = `${BASE_URL}${relativeLink}`;

    const date =
      $card.find('time[datetime]').attr('datetime') || null;

    const companyName =
      $card
        .find('.vacancy-card__company a.link-comp')
        .first()
        .text()
        .trim() || null;

    const companyRatingText =
      $card
        .find('.company-rating__value')
        .first()
        .text()
        .trim();

    const companyRating = companyRatingText
      ? Number(companyRatingText)
      : null;

    // Навыки — через текст + split, устойчиво к любой вёрстке
    const skills = $card
      .find('.vacancy-card__skills')
      .text()
      .split('•')
      .map(s => s.trim())
      .filter(Boolean);

    const meta = parseMeta($, $card);

    result.push({
      source: 'habr-career',

      vacancy: {
        id,
        title,
        date,

        meta: {
          link,
          ...meta,
        },

        company: {
          name: companyName,
          rating: companyRating,
        },

        skills,
      },
    });
  });

  return result;
}

/**
 * Загрузка вакансий с Habr Career
 */
async function fetchHabrVacancies({
  page = 1,
  ...filters
} = {}) {
  const path = buildVacanciesPath({
    page,
    specializations: [3, 4, 82],
  });
  ;
  const url = `${BASE_URL}${path}`;

  const html = await fetchHtml(url);
  return parseVacancies(html);
}

async function getAllVacancies({
  pages = 5,
  delay = 0,
  ...filters
} = {}) {
  const all = [];

  for (let page = 1; page <= pages; page++) {
    const batch = await fetchHabrVacancies({ page, ...filters });
    if (!batch.length) break;

    all.push(...batch);

    if (delay) {
      await new Promise(r => setTimeout(r, delay));
    }
  }

  return all;
}

module.exports = {
  fetchHabrVacancies,
  getAllVacancies,
};

/**
 * Локальный smoke-test
 */
if (require.main === module) {
  (async () => {
    const res = await getAllVacancies({ page: 1 });
    console.log(res.length);
  })();
}
