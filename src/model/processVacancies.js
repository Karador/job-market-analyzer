const { normalizeVacancy } = require('./normalizeVacancy');
const { scoreVacancy } = require('../score/scoreVacancies');
const { explainVacancy } = require('../score/explain');
const gateVacancy = require('../gate/gateVacancy');
const { normalizeTechnologies } = require('../analysis/techNormalizer');

function processRaw(raw) {
  return raw
    .map(normalizeVacancy)
    .map(normalizeTechnologies)
    .filter(vacancy => gateVacancy(vacancy).pass)
    .map(scoreVacancy)
    .map(explainVacancy);
}

module.exports = { processRaw };
