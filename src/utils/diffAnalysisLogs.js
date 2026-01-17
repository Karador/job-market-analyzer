const fs = require('fs');
const paths = require('../config/paths');

/**
 * Compare two analysis logs (as objects or file paths) and print key differences.
 */
function diffAnalysisLogs(logA, logB) {
    // Если переданы пути к файлам, читаем JSON
    if (typeof logA === 'string') logA = JSON.parse(fs.readFileSync(logA, 'utf-8'));
    if (typeof logB === 'string') logB = JSON.parse(fs.readFileSync(logB, 'utf-8'));

    console.log('--- Analysis Diff ---');
    console.log(`Timestamp A: ${logA.timestamp}`);
    console.log(`Timestamp B: ${logB.timestamp}\n`);

    const diffValue = (a, b) => (typeof a === 'number' && typeof b === 'number') ? (b - a).toFixed(3) : 'N/A';

    // 1. Score stats
    console.log('Score Stats Diff:');
    for (const key of Object.keys(logA.summary.scoreStats)) {
        console.log(`  ${key}: ${logA.summary.scoreStats[key]} -> ${logB.summary.scoreStats[key]}  (Δ=${diffValue(logA.summary.scoreStats[key], logB.summary.scoreStats[key])})`);
    }

    // 2. Penalty stats
    console.log('\nPenalty Stats Diff:');
    for (const key of Object.keys(logA.summary.penaltyStats)) {
        console.log(`  ${key}: ${logA.summary.penaltyStats[key]} -> ${logB.summary.penaltyStats[key]}  (Δ=${diffValue(logA.summary.penaltyStats[key], logB.summary.penaltyStats[key])})`);
    }

    // 3. Meta stats
    console.log('\nMeta Stats Diff:');
    for (const key of Object.keys(logA.summary.metaStats)) {
        console.log(`  ${key}: ${logA.summary.metaStats[key]} -> ${logB.summary.metaStats[key]}  (Δ=${diffValue(logA.summary.metaStats[key], logB.summary.metaStats[key])})`);
    }

    // 4. Rank distribution
    console.log('\nRank Distribution Diff:');
    for (const rank of Object.keys(logA.summary.rankDistribution)) {
        console.log(`  ${rank}: ${logA.summary.rankDistribution[rank]} -> ${logB.summary.rankDistribution[rank]}  (Δ=${logB.summary.rankDistribution[rank] - logA.summary.rankDistribution[rank]})`);
    }

    // 5. Meta signal average delta
    console.log('\nMeta Signal Avg Delta Diff:');
    for (const signal of Object.keys(logA.metaSignals.impact)) {
        const deltaA = logA.metaSignals.impact[signal] || 0;
        const deltaB = logB.metaSignals.impact[signal] || 0;
        console.log(`  ${signal}: ${deltaA} -> ${deltaB}  (Δ=${(deltaB - deltaA).toFixed(3)})`);
    }

    console.log('\n--- End of Diff ---');
}

module.exports = { diffAnalysisLogs };

if (require.main === module) {
  (async () => {
    const res = await diffAnalysisLogs(`${paths.logs}/analysis_1768584355332.json`, `${paths.logs}/analysis_1768589317302.json`);
  })();
}
