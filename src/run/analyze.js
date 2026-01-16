const { loadVacancies } = require('../storage/vacancies.storage');
const { scoreStats } = require('../analysis/scoreStats');
const { penaltyStats } = require('../analysis/penaltyStats');
const { marketProfile } = require('../analysis/marketProfile');
const { skillGapFromTopKeywords } = require('../analysis/skillGapFromTopKeywords');
const { marketRoleProfile } = require('../analysis/marketRoleProfile');
const { vacancyMetaStats, metaSignalFrequency, metaSignalImpact, metaSignalsByRank } = require('../analysis/vacancyMetaStats');

async function runAnalyze() {
    const scoredVacancies = await loadVacancies();

    console.log("stats: ", scoreStats(scoredVacancies));
    console.log("penalties: ", penaltyStats(scoredVacancies));
    console.log("meta: ", vacancyMetaStats(scoredVacancies));
    console.log("metaSignalFrequency: ", metaSignalFrequency(scoredVacancies));
    console.log("metaSignalImpact: ", metaSignalImpact(scoredVacancies));
    console.log("metaSignalsByRank: ", metaSignalsByRank(scoredVacancies));
    console.dir(marketProfile(scoredVacancies), { depth: null });
    console.dir(skillGapFromTopKeywords(scoredVacancies), { depth: null });
    console.dir(marketRoleProfile(scoredVacancies), { depth: null });
}

module.exports = { runAnalyze };
