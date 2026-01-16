const { scoreStats } = require('../analysis/scoreStats');
const { penaltyStats } = require('../analysis/penaltyStats');
const { marketProfile } = require('../analysis/marketProfile');
const { skillGapFromTopKeywords } = require('../analysis/skillGapFromTopKeywords');
const {
    vacancyMetaStats,
    metaSignalFrequency,
    metaSignalImpact,
    metaSignalCooccurrence,
} = require('../analysis/vacancyMetaStats');

function collectAnalysisLog(scoredVacancies) {
    const timestamp = new Date().toISOString();

    const scores = scoreStats(scoredVacancies);
    const penalties = penaltyStats(scoredVacancies);
    const meta = vacancyMetaStats(scoredVacancies);
    const metaFreq = metaSignalFrequency(scoredVacancies);
    const metaImpact = metaSignalImpact(scoredVacancies);
    const metaCo = metaSignalCooccurrence(scoredVacancies);
    const market = marketProfile(scoredVacancies);
    const skillGap = skillGapFromTopKeywords(scoredVacancies);

    return {
        timestamp,
        summary: {
            totalVacancies: scoredVacancies.length,
            scoreStats: scores,
            penaltyStats: penalties,
            metaStats: meta,
            rankDistribution: market.coverage.buckets
        },
        metaSignals: {
            frequency: metaFreq,
            impact: metaImpact.reduce((acc, s) => {
                acc[s.signal] = s.avgDelta;
                return acc;
            }, {}),
            cooccurrence: metaCo
        },
        marketProfile: {
            coverage: market.coverage,
            techShare: market.techShare.overall,
            stackShapes: market.stackShapes
        },
        skillGap
    };
}

module.exports = { collectAnalysisLog };
