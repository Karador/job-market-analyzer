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
        education: "not_required_or_not_specified",
        excluded_text: "python,java,golang,qa,1c,1с,senior,android,ios,flutter",
    });

    const html = await fetchHtml(BASE_URL + path, {
        referer: BASE_URL,
    });
    if (!html) return null;

    const $ = cheerio.load(html);

    const pages = $('[data-qa="vacancies-search-header"]')
        .map((_, el) => $(el).text().match(/\d+(\.\d+)?/g))
        .get()
        .join('')

    return Math.min(Math.ceil(pages ? pages / 50 : 0), 39);
}

function extractInitialState($) {
    const raw =
        $('#HH-Lux-InitialState').text().trim() ||
        $('template#HH-Lux-InitialState').text().trim();

    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function normalizeCompensation(comp) {
  if (!comp || comp.noCompensation) return null;

  const from = Number.isFinite(comp.from) ? comp.from : null;
  const to = Number.isFinite(comp.to) ? comp.to : null;

  const currency = comp.currencyCode || null;

  const gross = typeof comp.gross === 'boolean' ? comp.gross : null;

  const period = comp.mode || null;

  const frequency = comp.frequency || null;

  return { from, to, currency, gross, period, frequency };
}

function mapVacancy(v) {
  return {
    id: v.vacancyId,
    source: 'hh',
    title: v.name || '',
    link: v?.links?.desktop || null,

    company: v?.company?.visibleName || v?.company?.name || '',
    trustedEmployer: Boolean(v?.company?.['@trusted']),
    employerRating: v?.company?.employerReviews?.totalRating
      ? Number(v.company.employerReviews.totalRating)
      : null,
    employerReviewsCount: v?.company?.employerReviews?.reviewsCount ?? null,

    area: v?.area?.name || null,
    address: v?.address?.displayName || null,

    experience: v?.workExperience || '',
    workSchedule: v?.['@workSchedule'] || null,

    snippetReq: v?.snippet?.req || '',
    snippetResp: v?.snippet?.resp || '',
    snippetCond: v?.snippet?.cond || '',
    snippetSkills: v?.snippet?.skill || '',

    compensation: normalizeCompensation(v?.compensation),

    responsesCount: v?.responsesCount ?? null,
    onlineUsersCount: v?.online_users_count ?? null,

    publishedAt: v?.publicationTime?.$ || null,
    premium: Boolean(v?.vacancyProperties?.calculatedStates?.HH?.premium),
  };
}

/**
 * Парсинг одной страницы вакансий
 */
async function getVacancies(path) {
    const html = await fetchHtml(BASE_URL + path);
    if (!html) return null;

    const $ = cheerio.load(html);

    const vacanciesRaw = extractInitialState($).vacancySearchResult.vacancies

    return vacanciesRaw.filter(v => v.vacancyId && v?.links?.desktop).map(mapVacancy)
}

/**
 * Загрузка одной страницы
 */
async function loadVacanciesPage(page) {
    const path = buildHHVacanciesPath({
        page,
        professionalRole: 96,
        education: "not_required_or_not_specified",
        excluded_text: "python,java,golang,qa,1c,1с,senior,android,ios,flutter",
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
        pages: lastPage,
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
        const res = await getFreshVacancies({ pages: 1 });
        console.log(res.length, res.slice(0, 2));
    })();
}
