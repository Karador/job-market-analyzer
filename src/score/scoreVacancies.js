const {
  entrySignals,
  softPenalties,
  qualitySignals
} = require('./dictionaries');

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

function scoreVacancy(vacancy) {
  const text = vacancy.text.toLowerCase();
  const tech = vacancy.tech || {};
  const meta = tech.meta || {};

  const quality = scoreQuality(text);
  const entry = scoreEntry(text);
  const softPenalty = scoreSoftPenalties(text);

  // --- CORE ---
  const coreProfile = quality.score;

  // --- STACK DIFFERENTIATORS (из аналитики рынка) ---
  let stackBonus = 0;

  if (meta.hasBackend && tech.technologies?.nodejs) {
    stackBonus = 0.2;          // frontend + node
  } else if (meta.hasBackend) {
    stackBonus = 0.12;         // frontend + backend
  } else {
    stackBonus = 0;            // pure frontend
  }

  // --- ENTRY AS CONTEXT BONUS ---
  const entryBonus =
    entry.normalized > 0 ? 0.05 * entry.normalized : 0;

  const total = Math.max(
    0,
    Math.min(
      1,
      coreProfile +
        stackBonus +
        entryBonus +
        softPenalty.penalty
    )
  );

  return {
    vacancy,
    scores: {
      total: total,
      breakdown: {
        coreProfile,
        stackBonus,
        entryBonus,
        softPenalty: softPenalty.penalty
      },
      meta: {
        hasBackend: meta.hasBackend,
        hasNode: Boolean(tech.technologies?.nodejs),
        entry: entry.normalized > 0,
        hasRedFlags: quality.redFlags.length > 0
      }
    }
  };
}

module.exports = { scoreVacancy };
