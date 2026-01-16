function gateVacancy(vacancy) {
  const tech = vacancy.tech;
  const text = vacancy.text.toLowerCase();
  const meta = tech?.meta ?? {};
  const technologies = tech?.technologies ?? {};

  // --- HARD REJECT: РОЛЬ НЕ ФРОНТ / НЕ ВЕБ ---
  if (
    text.includes('1c') ||
    text.includes('1с') ||
    text.includes('битрикс') ||
    text.includes('bitrix') ||
    text.includes('support') ||
    text.includes('manager') ||
    text.includes('дизайнер')
  ) {
    return { pass: false, reason: 'hard_reject' };
  }

  const hasFrontendSignal =
    meta.hasFrontend ||
    text.includes('frontend') ||
    text.includes('front') ||
    text.includes('web');

  const hasJsSignal =
    technologies.javascript ||
    technologies.typescript;

  const hasBackendOnly =
    meta.hasBackend &&
    !hasFrontendSignal;

  // --- BACKEND ONLY ---
  if (hasBackendOnly) {
    return { pass: false, reason: 'backend_only' };
  }

  // --- НЕТ НИ WEB, НИ JS ---
  if (!hasFrontendSignal && !hasJsSignal) {
    return { pass: false, reason: 'no_frontend_signal' };
  }

  // --- DOTNET BACKEND ---
  if (technologies.dotnet && !hasFrontendSignal) {
    return { pass: false, reason: 'dotnet_backend' };
  }

  // ВСЁ ОСТАЛЬНОЕ ПРОПУСКАЕМ
  return {
    pass: true,
    metaPatch: {
      hasFrontendSignal,
      hasJsSignal
    }
  };
}

module.exports = { gateVacancy };
