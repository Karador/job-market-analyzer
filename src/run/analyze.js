const { loadVacancies } = require('../storage/vacancies.storage');
const { analyzePenalties } = require('../analysis/analyzePenalties');
const { scoreStats } = require('../analysis/scoreStats');
const { penaltyStats } = require('../analysis/penaltyStats');
const { markedStats } = require('../analysis/markedStats');
const { marketProfile } = require('../analysis/marketProfile');
const { skillGapFromTopKeywords } = require('../analysis/skillGapFromTopKeywords');
const { marketRoleProfile } = require('../analysis/marketRoleProfile');

async function runAnalyze() {
    const scoredVacancies = await loadVacancies();

    console.log("stats: ", scoreStats(scoredVacancies));
    console.log("penalties: ", penaltyStats(scoredVacancies));
    console.log("analyze penalties ", analyzePenalties(scoredVacancies));
    console.dir(markedStats(scoredVacancies), { depth: null });
    console.dir(marketProfile(scoredVacancies), { depth: null });
    console.dir(skillGapFromTopKeywords(scoredVacancies), { depth: null });
    console.dir(marketRoleProfile(scoredVacancies), { depth: null });
}

module.exports = { runAnalyze };
