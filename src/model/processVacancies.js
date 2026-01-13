const { normalizeVacancy } = require('./normalizeVacancy');
const { computeStackShape } = require('../analysis/stackShape');
const { scoreVacancy } = require('../score/scoreVacancies');
const { explainVacancy } = require('../score/explain');
const { gateVacancy } = require('../gate/gateVacancy');
const { normalizeTechnologies } = require('../analysis/techNormalizer');

function processRaw(raw) {
  return raw
    .map(normalizeVacancy)
    .map(normalizeTechnologies)
    .map(computeStackShape)
    .filter(vacancy => gateVacancy(vacancy).pass)
    .map(scoreVacancy)
    .map(explainVacancy);
}

module.exports = { processRaw };
