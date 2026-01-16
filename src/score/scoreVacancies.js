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

function scoreMetaContext(vacancy) {
  let delta = 0;
  const signals = [];

  const { meta, salary } = vacancy;

  // --- COMPANY RATING ---
  const rating = meta?.companyRating;
  const reviews = meta?.employerReviewsCount;

  if (rating >= 4.5) { delta += 0.08; signals.push('rating-4.5+'); }
  else if (rating >= 4.0) { delta += 0.05; signals.push('rating-4+'); }
  else if (rating > 0 && rating < 3.0) { delta -= 0.1; signals.push('rating-low'); }

  if (rating >= 4 && reviews >= 50) {
    delta += 0.03;
    signals.push('rating-trusted');
  }

  // --- SALARY ---
  if (!salary || !salary.from) {
    delta -= 0.05;
    signals.push('no-salary');
  }

  // --- EXPERIENCE + STACK ---
  if ((meta?.experience === 'between1And3' || meta?.experience === 'Middle') && vacancy.tech.meta.frontendFramework === 'react') {
    delta += 0.08;
    signals.push('react-1-3');
  }

  return {
    delta: Math.max(-0.2, Math.min(0.2, delta)),
    signals
  };
}


function scoreVacancy(vacancy) {
  const text = vacancy.text.toLowerCase();
  const tech = vacancy.tech || {};
  const meta = tech.meta || {};

  const quality = scoreQuality(text);
  const entry = scoreEntry(text);
  const softPenalty = scoreSoftPenalties(text);
  const relevancePenalty = scoreRelevancePenalty(meta);
  const metaContext = scoreMetaContext(vacancy);

  // --- CORE ---
  const coreProfile = quality.score * 0.85;

  // --- ENTRY AS CONTEXT BONUS ---
  const entryMultiplier =
    entry.normalized > 0 ? 1 + 0.1 * entry.normalized : 1;

  const base = coreProfile +
    relevancePenalty +
    softPenalty.penalty +
    metaContext.delta;

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
