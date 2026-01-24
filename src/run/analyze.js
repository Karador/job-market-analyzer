const paths = require('../config/paths');
const { loadVacancies } = require('../storage/vacancies.storage');
const { scoreStats } = require('../analysis/scoreStats');
const { penaltyStats } = require('../analysis/penaltyStats');
const { marketProfile } = require('../analysis/marketProfile');
const { skillGapFromTopKeywords } = require('../analysis/skillGapFromTopKeywords');
const { marketRoleProfile } = require('../analysis/marketRoleProfile');
const {
    vacancyMetaStats,
    metaSignalFrequency,
    metaSignalImpact,
    metaSignalsByRank,
    metaSignalCooccurrence,
} = require('../analysis/vacancyMetaStats');

const ANALYZE_PROFILES = {
    brief: [
        'scoreStats',
        'penaltyStats'
    ],
    meta: [
        'vacancyMetaStats',
        'metaSignalFrequency',
        'metaSignalImpact',
        'metaSignalsByRank',
        'metaSignalCooccurrence'
    ],
    market: [
        'marketProfile',
        'skillGapFromTopKeywords',
        'marketRoleProfile'
    ],
    full: 'all'
};

const analyzers = {
    scoreStats,
    penaltyStats,
    vacancyMetaStats,
    metaSignalFrequency,
    metaSignalImpact,
    metaSignalsByRank,
    marketProfile,
    skillGapFromTopKeywords,
    marketRoleProfile,
    metaSignalCooccurrence
};

const profile = process.argv[3] ?? 'market';
const vacanciesPath = process.argv[4] === 'new' ? paths.rescoredVacancies : paths.vacancies;

async function runAnalyze() {
    const scoredVacancies = await loadVacancies(vacanciesPath);

    if (!ANALYZE_PROFILES[profile]) {
        console.warn(`Unknown analyze profile: ${profile}, fallback to market`);
        profile = 'market';
    }

    const list =
        ANALYZE_PROFILES[profile] === 'all'
            ? Object.keys(analyzers)
            : ANALYZE_PROFILES[profile];

    for (const name of list) {
        console.log(`${name}:`);
        console.dir(analyzers[name](scoredVacancies), { depth: null });
    }
}

module.exports = { runAnalyze };
