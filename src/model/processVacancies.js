const { normalizeVacancy } = require('./normalizeVacancy');
const { scoreVacancy } = require('../score/scoreVacancies');
const { explainVacancy } = require('../score/explain');
const gateVacancy = require('../gate/gateVacancy');

function processRaw(raw) {
  return raw
    .map(normalizeVacancy)
    .filter(vacancy => gateVacancy(vacancy).pass)
    .map(scoreVacancy)
    .map(explainVacancy);
}

module.exports = { processRaw };
