function explainVacancy(scored) {
  const { vacancy, scores } = scored;
  const { breakdown, meta, total } = scores;

  const notes = [];

  if (breakdown.coreProfile >= 0.9) {
    notes.push('Высокое качество вакансии');
  }

  if (breakdown.stackBonus > 0) {
    notes.push(
      meta.hasNode
        ? 'Frontend + Node.js профиль'
        : 'Frontend + backend профиль'
    );
  }

  if (breakdown.entryBonus > 0) {
    notes.push('Есть entry/junior сигналы');
  }

  if (breakdown.softPenalty < 0) {
    notes.push('Есть смягчающие факторы (неясные условия, риски)');
  }

  if (meta.hasRedFlags) {
    notes.push('Обнаружены негативные сигналы');
  }

  return {
    ...scored,
    explain: {
      total,
      breakdown,
      meta,
      notes
    }
  };
}

module.exports = { explainVacancy };
