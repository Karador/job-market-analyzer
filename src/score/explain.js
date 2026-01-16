function explainVacancy(scored) {
  const { vacancy, scores } = scored;
  const { breakdown, meta, total } = scores;

  const notes = [];

  // --- качество вакансии ---
  if (breakdown.coreProfile >= 0.9) notes.push('Высокое качество вакансии');

  // --- технологический профиль ---
  if (meta.hasNode && vacancy.tech.meta.stackShape?.includes('frontend')) {
    notes.push('Frontend + Node.js профиль');
  } else if (vacancy.tech.meta.stackShape?.includes('frontend')) {
    notes.push('Frontend профиль');
  } else if (meta.hasBackend && !meta.hasFrontend) {
    notes.push('Backend профиль');
  }

  // --- entry signals ---
  if (meta.entry) notes.push('Есть entry/junior сигналы');

  // --- мягкие штрафы ---
  if (breakdown.softPenalty < 0) notes.push('Есть смягчающие факторы / риски');

  // --- красные флаги ---
  if (meta.hasRedFlags) notes.push('Обнаружены негативные сигналы');

  // --- meta signals ---
  const metaSignals = breakdown.metaContext.signals || [];
  if (metaSignals.includes('rating-4+')) notes.push('Рейтинг компании 4+');
  if (metaSignals.includes('rating-4.5+')) notes.push('Рейтинг компании 4.5+');
  if (metaSignals.includes('rating-trusted')) notes.push('Trusted работодатель (≥50 отзывов)');
  if (metaSignals.includes('rating-low')) notes.push('Низкий рейтинг компании');
  if (metaSignals.includes('no-salary')) notes.push('Нет информации о зарплате');
  if (metaSignals.includes('react-1-3')) notes.push('React опыт 1-3 года');

  return {
    ...scored,
    explain: {
      total,
      coreProfile: breakdown.coreProfile,
      stackShape: vacancy.tech.meta.stackShape,
      softPenalty: breakdown.softPenalty,
      metaContext: breakdown.metaContext.delta,
      tech: vacancy.tech.tags,
      notes
    }
  };
}

module.exports = { explainVacancy };
