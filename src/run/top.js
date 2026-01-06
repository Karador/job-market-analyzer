const { loadVacancies } = require('../storage/vacancies.storage');
const { markSeen, loadSeen } = require('../storage/seen.storage');

async function runTop() {
    const vacancies = await loadVacancies();
    const seen = loadSeen();

    const top = vacancies
        .filter(v => v.explain.verdict !== 'reject' && !seen[v.vacancy.id])
        .sort((a, b) => b.scores.total - a.scores.total)
        .slice(0, 5);

    const shouldMarkSeen = process.env.NODE_ENV === 'production';

    if (top.length && shouldMarkSeen) {
        markSeen(top, 'remote-job');
    }

    top.forEach(v => {
        console.log(v.vacancy.meta.link, v.scores.total);
    });
}

module.exports = { runTop };
