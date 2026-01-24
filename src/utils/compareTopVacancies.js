const fs = require('fs');
const { loadVacancies } = require('../storage/vacancies.storage');
const { vacancies, rescoredVacancies, logs } = require('../config/paths');

function buildDiff(id, oldById, newById) {
    const oldV = oldById.get(id);
    const newV = newById.get(id);

    const v = oldV || newV;

    return {
        id,
        title: v.vacancy.title,
        link: v.vacancy.meta.link,
        company: v.vacancy.company,

        scoreDiff: parseFloat((newV?.scores?.total - oldV?.scores?.total).toFixed(2)),

        metaSignalsOld: oldV?.scores?.breakdown?.metaContext?.signals,
        metaSignalsNew: newV?.scores?.breakdown?.metaContext?.signals,

        tech: v.vacancy.tech?.tags ?? [],
        remote: v.vacancy.meta?.remote,
        area: v.vacancy.meta?.area
    };
}

async function compareTopVacancies() {
    const oldVacancies = await loadVacancies(vacancies);
    const newVacancies = await loadVacancies(rescoredVacancies);

    const byId = (list) =>
        new Map(list.map(v => [v.vacancy.id, v]));

    const oldById = byId(oldVacancies);
    const newById = byId(newVacancies);

    const oldTop = oldVacancies.filter(v => v.rank === 'top');
    const newTop = newVacancies.filter(v => v.rank === 'top');

    const oldTopIds = new Set(oldTop.map(v => v.vacancy.id));
    const newTopIds = new Set(newTop.map(v => v.vacancy.id));

    const stayed = [...oldTopIds].filter(id => newTopIds.has(id));
    const dropped = [...oldTopIds].filter(id => !newTopIds.has(id));
    const added = [...newTopIds].filter(id => !oldTopIds.has(id));

    const result = {
        summary: {
            oldTopCount: oldTop.length,
            newTopCount: newTop.length,
            stayed: stayed.length,
            added: added.length,
            dropped: dropped.length
        },

        stayedInTop: stayed.map(id => buildDiff(id, oldById, newById)),
        addedToTop: added.map(id => buildDiff(id, oldById, newById)),
        droppedFromTop: dropped.map(id => buildDiff(id, oldById, newById))
    };

    fs.writeFileSync(
        `${logs}/compare_top_${Date.now()}.json`,
        JSON.stringify(result, null, 2)
    );

    return result;
}

module.exports = { compareTopVacancies };

if (require.main === module) {
    (async () => {
        const res = await compareTopVacancies();
        console.dir(res, { depth: null })
    })();
}
