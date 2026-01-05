const taskTypes = {
  web: {
    weight: 1,
    keywords: {
      frontend: 1,
      backend: 1,
      fullstack: 1.2,
      react: 1.5,
      vue: 1.3,
      javascript: 0.7,
      html: 0.3,
      css: 0.3
    }
  },
  automation: {
    weight: 1,
    keywords: {
      automation: 1.5,
      rpa: 1.5,
      bot: 0.3,
      script: 0.3,
      integration: 1
    }
  },
  data: {
    weight: 1,
    keywords: {
      data: 1,
      airflow: 1.2,
      sql: 0.8,
      python: 0.6
    }
  },
};

const entrySignals = {
  positive: {
    'без опыта': 2,
    'начинающий': 1.5,
    'junior': 1.5,
    'стажировка': 1.2,
    'обучение': 1
  },
  negative: {
    '3+': -2,
    'senior': -3,
    'lead': -3,
    'highload': -1.5
  }
};

const softPenalties = {
  experienceMismatch: {
    phrases: [
      'middle',
      'middle+',
      'senior',
      'lead',
      '3+',
      '5+'
    ],
    penalty: -0.25
  },

  unclearSalary: {
    phrases: [
      'з.п. не указана',
      'по договоренности',
      'от 0 до',
      'без указания зарплаты'
    ],
    penalty: -0.2
  },

  soloResponsibility: {
    phrases: [
      'вся зона ответственности',
      'единственный разработчик',
      'полностью твоя ответственность',
      'самостоятельно',
      'стартап'
    ],
    penalty: -0.15
  }
};

const qualitySignals = {
  negative: {
    'помогаем найти работу': -4,
    'обучаем с нуля': -3,
    'карьерный рост без опыта': -3,
    'поддержка на старте карьеры': -3,
    'мы помогаем начинающим': -3,
    'заполни анкету': -1,
    'наставник поможет': -1,
    'мы вас научим': -2
  }
};

function scoreSoftPenalties(text) {
  let penalty = 0;
  const matched = [];

  for (const [key, rule] of Object.entries(softPenalties)) {
    for (const phrase of rule.phrases) {
      if (text.includes(phrase)) {
        penalty += rule.penalty;
        matched.push({ type: key, phrase, value: rule.penalty });
        break; // важно: один штраф на правило
      }
    }
  }

  // ограничиваем суммарный штраф
  penalty = Math.max(penalty, -0.4);

  return {
    penalty,
    matched
  };
}


function verdictFromScore(total) {
  if (total >= 0.7) return 'strong_match';
  if (total >= 0.45) return 'maybe';
  if (total >= 0.25) return 'weak';
  return 'reject';
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
  const text = normalize(
    `${vacancy.title} ${vacancy.description || ''}`
  );

  const groups = scoreGroups(text);
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


  const scored = {
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

  return {
    ...scored,
    explain: explainVacancy(scored)
  };
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
  };
}

function scoreVacancies(vacancies = []) {
  return vacancies.map(vacancy => scoreVacancy(vacancy));
}

function normalize(text = '') {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = { scoreVacancies };
