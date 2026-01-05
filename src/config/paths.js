const path = require('path');
const ROOT = process.cwd();

module.exports = {
  root: ROOT,
  src: path.join(ROOT, 'src'),
  data: path.join(ROOT, 'data'),

  vacancies: path.join(ROOT, 'data', 'vacancies.jsonl'),
};
