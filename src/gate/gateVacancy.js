const mustHaveVariants = [
  "react", "vue", "angular",
  "frontend", "web",
  "javascript", "js",
  "фронтенд", "фронт", "web-разработчик"
];

const strongPlus = ["typescript", "node", "next.js"];
const hardReject = ["1c", "bitrix", "support", "assistant", "manager"];
const backendRejectConditional = ["php"]; // reject если backend-heavy

const frontendKeywords = ["react", "vue", "angular", "html", "css", "js", "typescript", "next"];
const backendKeywords = ["php", "node", "java", "python", "ruby", "spring", "django", "1c"];

// Проверка соотношения фронт/бек
function isFrontendHeavy(keywords) {
  const frontendHits = keywords.filter(k => frontendKeywords.includes(k)).length;
  const backendHits = keywords.filter(k => backendKeywords.includes(k)).length;
  const ratio = frontendHits / Math.max(frontendHits + backendHits, 1);
  return ratio >= 0.6;
}

// hard reject
function hasHardReject(keywords) {
  return hardReject.some(h => keywords.includes(h));
}

// Условный reject (PHP + backend-heavy)
function hasConditionalReject(keywords, frontendHeavy) {
  return backendRejectConditional.some(h => keywords.includes(h) && !frontendHeavy);
}

// Функция расширенного mustHave
function hasMustHaveEnhanced(keywords) {
  const text = keywords.join(' ');

  // 1. Прямой match синонимов
  if (mustHaveVariants.some(m => keywords.includes(m))) {
    return true;
  }

  // 2. Комбинации слов
  if (/frontend.*javascript|javascript.*frontend|web.*developer|developer.*web/i.test(text)) {
    return true;
  }

  // 3. Если есть strongPlus
  if (strongPlus.some(k => keywords.includes(k))) {
    return true;
  }

  return false;
}

// Gate
function gateVacancy(vacancy) {
  const textKeywords = vacancy.text.toLowerCase().split(/[\s\-\.]+/); // пробел, дефис, точка
  const skillKeywords = (vacancy.skills ?? []).map(s => s.toLowerCase());

  const keywords = [...textKeywords, ...skillKeywords];

  const frontendHeavy = isFrontendHeavy(keywords);
  const reasons = [];

  // Must-have
  if (!hasMustHaveEnhanced(keywords)) {
    reasons.push({ type: "reject", code: "missing_must_have" });
  }

  // Hard reject
  if (hasHardReject(keywords)) {
    reasons.push({ type: "reject", code: "hard_reject" });
  }

  // Conditional backend reject
  if (hasConditionalReject(keywords, frontendHeavy)) {
    reasons.push({ type: "reject", code: "backend_php" });
  }

  // Пропуск
  const pass = reasons.every(r => r.type !== "reject") || reasons.length === 0;

  return {
    pass,
    reasons,
    frontendHeavy,
    strongPlusFound: strongPlus.filter(k => keywords.includes(k)),
    keywords,
  };
}

module.exports = gateVacancy;
