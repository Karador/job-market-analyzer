const { taskTypes, entrySignals, softPenalties, qualitySignals } = require('./dictionaries');

function scoreSoftPenalties(text) {
  let penalty = 0;
  const matched = [];

  for (const [key, rule] of Object.entries(softPenalties)) {
    for (const phrase of rule.phrases) {
      if (text.includes(phrase)) {
        penalty += rule.penalty;
        matched.push({ type: key, phrase, value: rule.penalty });
        break;
      }
    }
  }

  penalty = Math.max(penalty, -0.4);

  return {
    penalty,
    matched
  };
}

function scoreEntry(text) {
  let score = 0;
  const matched = [];

  for (const [phrase, weight] of Object.entries(entrySignals.positive)) {
    if (text.includes(phrase)) {
      score += weight;
      matched.push(phrase);
    }
  }

  for (const [phrase, weight] of Object.entries(entrySignals.negative)) {
    if (text.includes(phrase)) {
      score += weight;
      matched.push(phrase);
    }
  }

  return {
    raw: score,
    normalized: Math.max(0, Math.min(1, score / 3)),
    matched
  };
}

function scoreQuality(text) {
  let score = 1;
  const redFlags = [];

  for (const [phrase, weight] of Object.entries(qualitySignals.negative)) {
    if (text.includes(phrase)) {
      score += weight;
      redFlags.push(phrase);
    }
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    redFlags
  };
}

function scoreGroups(text) {
  const scores = {};
  const matches = {};
  let maxScore = 0;

  for (const [group, config] of Object.entries(taskTypes)) {
    let score = 0;
    matches[group] = [];

    for (const [word, weight] of Object.entries(config.keywords)) {
      if (text.includes(word)) {
        score += weight;
        matches[group].push({ word, weight });
      }
    }

    score *= config.weight;
    scores[group] = score;
    if (score > maxScore) maxScore = score;
  }

  for (const group in scores) {
    scores[group] = maxScore ? scores[group] / maxScore : 0;
  }

  return { scores, matches };
}

function scoreVacancy(vacancy) {
  const text = vacancy.text;

  const tech = vacancy.tech;

  const groups = scoreGroups(tech.tags);
  const entry = scoreEntry(text);
  const quality = scoreQuality(text);

  const maxGroupScore = Math.max(...Object.values(groups.scores));

  const softPenalty = scoreSoftPenalties(text);

  const baseTotal =
    0.4 * maxGroupScore +
    0.4 * entry.normalized +
    0.2 * quality.score;

  const total = Math.max(
    0,
    Math.min(1, baseTotal + softPenalty.penalty)
  );

  return {
    vacancy,
    scores: {
      groups,
      entry,
      quality,
      softPenalty,
      baseTotal: Number(baseTotal.toFixed(2)),
      total: Number(total.toFixed(2))
    }
  };
}

module.exports = { scoreVacancy };
