const { normalizeVacancy } = require('./normalizeVacancy');
const { scoreVacancy } = require('../score/scoreVacancies');
const { explainVacancy } = require('../score/explain');

function processRaw(raw) {
  return raw
    .map(normalizeVacancy)
    .map(scoreVacancy)
    .map(explainVacancy);
}

module.exports = { processRaw };
