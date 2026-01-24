const path = require('path');
const ROOT = process.cwd();

module.exports = {
  root: ROOT,
  src: path.join(ROOT, 'src'),
  data: path.join(ROOT, 'data'),
  logs: path.join(ROOT, 'logs'),

  vacancies: path.join(ROOT, 'data', 'vacancies.jsonl'),
  rescoredVacancies: path.join(ROOT, 'data', 'rescoredVacancies.jsonl'),
  seen: path.join(ROOT, 'data', 'seen.json'),
};
