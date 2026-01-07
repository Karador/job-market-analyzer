const { loadVacancies } = require('../storage/vacancies.storage');
const { markSeen, loadSeen } = require('../storage/seen.storage');

async function runTop({ limit } = { limit: 5 }) {
    const vacancies = await loadVacancies();
    const seen = loadSeen();

    const top = vacancies
        .filter(v => v.explain.verdict !== 'reject' && !seen[v.vacancy.id])
        .sort((a, b) => b.scores.total - a.scores.total)
        .slice(0, limit);

    const shouldMarkSeen = process.env.NODE_ENV === 'production';

    if (top.length && shouldMarkSeen) {
        markSeen(top);
    }

    top.forEach(v => {
        console.log(
            v.scores.total,
            v.vacancy.title,
            '\n',
            v.vacancy.meta.link,
            '\n',
        );
    });
}

module.exports = { runTop };
