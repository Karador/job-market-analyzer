function normalizeVacancy(text = '') {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = { normalizeVacancy };