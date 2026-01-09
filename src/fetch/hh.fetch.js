const cheerio = require('cheerio');
const { buildHHVacanciesPath } = require('./hh.query');
const { fetchHtml } = require('./fetchHTML');

const BASE_URL = 'https://hh.ru';

/**
 * Получаем номер последней страницы
 */
async function getLastPage() {
    const path = buildHHVacanciesPath({
        page: 0,
        professionalRole: 96,
        industry: 7,
        education: "not_required_or_not_specified",
    });
    ;
    const html = await fetchHtml(BASE_URL + path, {
        referer: BASE_URL,
    });
    if (!html) return null;

    const $ = cheerio.load(html);

    const pages = $('[data-qa="vacancies-search-header"]')
        .map((_, el) => $(el).text().match(/\d+(\.\d+)?/g))
        .get()

    return Math.ceil(pages[0] ? pages[0] / 50 : 0);
}

/**
 * Парсинг одной страницы вакансий
 */
async function getVacancies(path) {
    const html = await fetchHtml(BASE_URL + path);
    if (!html) return null;

    const $ = cheerio.load(html);
    const vacancies = [];

    $('[data-qa="vacancy-serp__vacancy"]').each((_, el) => {
        const title = $(el).find('[data-qa="serp-item__title-text"]').first().text();
        const text = $(el).find('[data-qa="vacancy-serp__vacancy_snippet_responsibility"]').text()
            + ' ' + $(el).find('[data-qa="vacancy-serp__vacancy_snippet_requirement"]').text()
            + ' ' + $(el).find('[data-qa^="vacancy-serp__vacancy-compensation"]').first().text()
            + ' ' + $(el).find('[data-qa^="vacancy-serp__vacancy-work-experience-noExperience"]').first().text()
            + ' ' + $(el).find('[data-qa="vacancy-serp__vacancy-work-experience-between3And6"]').first().text()
            + ' ' + $(el).find('[data-qa="vacancy-serp__vacancy-work-experience-between1And3"]').first().text()
            + ' ' + $(el).find('[data-qa="vacancy-serp__vacancy-compensation-frequency-MONTHLY"]').first().text()
            + ' ' + $(el).find('[data-qa="vacancy-label-side-job"]').first().text();
        const link = $(el).find('[data-qa="serp-item__title"]').first().attr('href');
        const company = $(el).find('[data-qa="vacancy-serp__vacancy-employer-text"]').first().text();
        const isRemote = Boolean($(el).find('[data-qa="vacancy-label-work-schedule-remote"]').length);

        const idMatch = link.match(/\/vacancy\/(\d+)/);
        const id = idMatch ? idMatch[1] : null;

        if (!title || !id) {
            return
        };

        vacancies.push({
            id,
            source: 'hh',
            title,
            text,
            company,
            isRemote,
            link: link.startsWith('http') ? link : BASE_URL + link,
        });
    });

    return vacancies;
}

/**
 * Загрузка одной страницы
 */
async function loadVacanciesPage(page) {
    const path = buildHHVacanciesPath({
        page,
        professionalRole: 96,
        industry: 7,
        education: "not_required_or_not_specified",
    });

    try {
        const vacancies = await getVacancies(path);
        console.log(`HH страница ${page + 1}: ${vacancies.length} вакансий`);
        return vacancies;
    } catch (e) {
        console.log(`Ошибка загрузки HH страницы ${page}`, e);
        return [];
    }
}

/**
 * Загрузка первых N страниц
 */
async function getFreshVacancies({ pages = 1, delay = 2000 } = {}) {
    const result = [];

    for (let page = 0; page < pages; page++) {
        const vacancies = await loadVacanciesPage(page);
        if (!vacancies?.length) break;

        result.push(...vacancies);

        if (delay) {
            await new Promise(r => setTimeout(r, delay));
        }
    }

    return result;
}

/**
 * Загрузка всех страниц
 */
async function getAllVacancies({ delay = 2000 } = {}) {
    const lastPage = await getLastPage();
    if (lastPage === null) return [];

    return getFreshVacancies({
        pages: 1,
        delay,
    });
}

module.exports = {
    getFreshVacancies,
    getAllVacancies,
};

/**
 * Локальный smoke-test
 */
if (require.main === module) {
    (async () => {
        const res = await getAllVacancies({ page: 1 });
        console.log(res.length, res.slice(0, 5));
    })();
}
