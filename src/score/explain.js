const { entrySignals } = require('./dictionaries');

function verdictFromScore(total) {
  if (total >= 0.7) return 'strong_match';
  if (total >= 0.45) return 'maybe';
  if (total >= 0.25) return 'weak';
  return 'reject';
}

function explainVacancy(scored) {
  const { scores } = scored;

  const groupEntries = Object.entries(scores.groups.scores);
  const [bestGroup, bestGroupScore] =
    groupEntries.sort((a, b) => b[1] - a[1])[0];

  const notes = [];

  if (bestGroupScore > 0.7) {
    notes.push(`Сильный ${bestGroup}-профиль`);
  }

  if (scores.entry.raw > 0) {
    notes.push('Есть junior/entry сигналы');
  }

  if (scores.quality.redFlags.length > 0) {
    notes.push('Есть признаки спама/обучения');
  }

  return {
    ...scored,
    explain: {
      baseTotal: scores.baseTotal,
      total: scores.total,
      verdict: verdictFromScore(scores.total),
      softPenalty: scores.softPenalty,

      contributions: {
        groups: {
          chosen: bestGroup,
          score: bestGroupScore,
          matched: scores.groups.matches[bestGroup]
        },

        entry: {
          score: scores.entry.normalized,
          positive: scores.entry.matched.filter(p =>
            Object.keys(entrySignals.positive).includes(p)
          ),
          negative: scores.entry.matched.filter(p =>
            Object.keys(entrySignals.negative).includes(p)
          )
        },

        quality: {
          score: scores.quality.score,
          redFlags: scores.quality.redFlags
        }
      },

      notes
    },
  };
}

module.exports = { explainVacancy };
