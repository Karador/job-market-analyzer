const fs = require('fs');
const { vacancies, rescoredVacancies } = require('../config/paths');
const { loadVacancies } = require('../storage/vacancies.storage');

const mode = process.argv[3] ?? 'summary';

function buildTopDiff(oldV, newV, { minScoreDiff = 0.02 } = {}) {
    const byId = list =>
        new Map(list.map(v => [v.vacancy.id, v]));

    const oldAllMap = byId(oldV);
    const newAllMap = byId(newV);

    const oldTop = oldV.filter(v => v.rank === 'top');
    const newTop = newV.filter(v => v.rank === 'top');

    const oldMap = byId(oldTop);
    const newMap = byId(newTop);

    const stayed = [];
    const added = [];
    const dropped = [];

    for (const [id, newVac] of newMap) {
        const oldVac = oldMap.get(id);

        if (oldVac) {
            stayed.push({ oldVac, newVac });
        } else {
            added.push({ oldVac: oldAllMap.get(id), newVac });
        }
    }

    for (const [id, oldVac] of oldMap) {
        if (!newMap.has(id)) {
            dropped.push({ oldVac, newVac: newAllMap.get(id) });
        }
    }

    const scoreDiff = (o, n) => parseFloat(((n?.scores?.total || 0) - (o?.scores?.total || 0)).toFixed(2));

    return {
        stayed,
        added: added
            .map(v => ({ ...v, diff: scoreDiff(v.oldVac, v.newVac) }))
            .filter(v => Math.abs(v.diff) >= minScoreDiff),
        dropped: dropped
            .map(v => ({ ...v, diff: scoreDiff(v.oldVac, v.newVac) }))
            .filter(v => Math.abs(v.diff) >= minScoreDiff),
    };
}

function renderSummary(diff) {
    console.log('=== TOP COMPARISON SUMMARY ===\n');

    console.log(`Stayed in top: ${diff.stayed.length}`);
    console.log(`Added to top:  ${diff.added.length}`);
    console.log(`Dropped:       ${diff.dropped.length}\n`);

    const countSignals = list => {
        const map = new Map();
        for (const v of list) {
            const signals = v.newVac?.scores?.breakdown?.metaContext?.signals ||
                v.oldVac?.scores?.breakdown?.metaContext?.signals ||
                [];
            for (const s of signals) {
                map.set(s, (map.get(s) || 0) + 1);
            }
        }
        return [...map.entries()].sort((a, b) => b[1] - a[1]);
    };

    console.log('Top added signals:');
    for (const [s, c] of countSignals(diff.added).slice(0, 5)) {
        console.log(`  + ${s}: ${c}`);
    }

    console.log('\nTop dropped signals:');
    for (const [s, c] of countSignals(diff.dropped).slice(0, 5)) {
        console.log(`  - ${s}: ${c}`);
    }
}

function renderList(list, title) {
    console.log(`\n=== ${title.toUpperCase()} ===\n`);

    for (const { oldVac, newVac, diff } of list) {
        const v = newVac || oldVac;
        const meta = v.vacancy.meta;

        const signalsOld = oldVac?.scores?.breakdown?.metaContext?.signals || [];
        const signalsNew = newVac?.scores?.breakdown?.metaContext?.signals || [];

        const addedSignals = signalsNew.filter(s => !signalsOld.includes(s));
        const removedSignals = signalsOld.filter(s => !signalsNew.includes(s));

        console.log(
            `${diff > 0 ? '+' : ''}${diff}  ${v.vacancy.title} @ ${v.vacancy.company}`
        );
        console.log(
            `     ${v.vacancy.tech?.tags?.join(', ')} | ` +
            `${meta.remote ? 'remote' : 'office/hybrid'} | ${meta.area}`
        );

        if (addedSignals.length)
            console.log(`     + ${addedSignals.join(', ')}`);
        if (removedSignals.length)
            console.log(`     - ${removedSignals.join(', ')}`);

        console.log(`     ${meta.link}\n`);
    }
}

async function runCompare({ minScoreDiff = 0.02 } = {}) {
    const oldV = await loadVacancies(vacancies);
    const newV = await loadVacancies(rescoredVacancies);
    const diff = buildTopDiff(oldV, newV, { minScoreDiff })

    if (mode === 'summary') renderSummary(diff);
    if (mode === 'added') renderList(diff.added, 'added to top');
    if (mode === 'dropped') renderList(diff.dropped, 'dropped from top');
}

module.exports = { runCompare }
