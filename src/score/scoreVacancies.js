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
    score: Math.max(0.4, Math.min(1, score)),
    redFlags
  };
}

function scoreRelevancePenalty(meta) {
  let relevancePenalty = 0;

  if (meta.stackShape === 'frontend-only-weak') {
    relevancePenalty -= 0.05;
  }

  if (meta.intentConfidence === 'medium') {
    relevancePenalty -= 0.05;
  }

  if (meta.intentConfidence === 'low') {
    relevancePenalty -= 0.1;
  }

  if (meta.ecosystem === 'non-js') {
    relevancePenalty -= 0.3;
  }

  if (meta.frontendFramework === 'vue' || meta.frontendFramework === 'angular') {
    relevancePenalty -= 0.05;
  }

  if (meta.isLayoutHeavy) {
    relevancePenalty -= 0.15;
  }

  if (meta.isLegacyTooling) {
    relevancePenalty -= 0.15;
  }

  if (meta.hasBackend && !meta.hasFrontend) {
    relevancePenalty -= 0.2;
  }

  return Math.max(relevancePenalty, -0.4);
}

function scoreVacancy(vacancy) {
  const text = vacancy.text.toLowerCase();
  const tech = vacancy.tech || {};
  const meta = tech.meta || {};

  const quality = scoreQuality(text);
  const entry = scoreEntry(text);
  const softPenalty = scoreSoftPenalties(text);
  const relevancePenalty = scoreRelevancePenalty(meta);

  // --- CORE ---
  const coreProfile = quality.score * 0.85;

  // --- STACK DIFFERENTIATORS (из аналитики рынка) ---
  // let stackBonus = 0;

  const isFrontendRole =
    meta.hasFrontend ||
    meta.frontendFramework !== null;

  const isFullstack =
    meta.hasFrontend && meta.hasBackend;

  // if (isFullstack && tech.technologies?.nodejs) {
  //   stackBonus = 0.15;   // frontend + node
  // } else if (isFullstack) {
  //   stackBonus = 0.08;
  // } else {               // frontend + backend
  //   stackBonus = 0;      // pure frontend
  // }

  // --- ENTRY AS CONTEXT BONUS ---
  const entryMultiplier =
    entry.normalized > 0 ? 1 + 0.1 * entry.normalized : 1;

  const base = coreProfile +
    // stackBonus +
    relevancePenalty +
    softPenalty.penalty

  const total = Math.max(
    0,
    Math.min(1, base * entryMultiplier)
  );

  return {
    vacancy,
    scores: {
      total: Number(total.toFixed(2)),
      breakdown: {
        coreProfile,
        // stackBonus,
        entryMultiplier,
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
