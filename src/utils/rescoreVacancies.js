const { saveSnapshot, loadVacancies } = require('../storage/vacancies.storage');

const { scoreVacancy } = require('../score/scoreVacancies');
const { explainVacancy } = require('../score/explain');

async function rescoreVacancies() {
    const vacancies = await loadVacancies();

    const scored = vacancies.map(v => scoreVacancy(v.vacancy)).map(explainVacancy);
    return await saveSnapshot(scored);
}

module.exports = { rescoreVacancies };

if (require.main === module) {
    (async () => {
        const res = await rescoreVacancies();
        console.log(`rescored vacancies: ${res}`);
    })();
}
