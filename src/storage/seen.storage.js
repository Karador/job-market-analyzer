const fs = require('fs');
const paths = require('../config/paths');
const { vacancyKey, vacancyKeyByParts } = require('../utils/vacancyKey');

function loadSeen() {
  if (!fs.existsSync(paths.seen)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(paths.seen, 'utf-8'));
  } catch {
    return {};
  }
}

function saveSeen(seen) {
  fs.writeFileSync(
    paths.seen,
    JSON.stringify(seen, null, 2)
  );
}

function markSeen(vacancies) {
  const seen = loadSeen();
  const now = new Date().toISOString();

  let added = 0;

  for (const v of vacancies) {
    if (!v?.vacancy?.id || !v?.vacancy.meta.source) continue;

    const key = vacancyKey(v);

    if (!seen[key]) {
      seen[key] = {
        firstSeen: now,
        lastSeen: now,
        sourse: v.vacancy.meta.source,
      };
      added++;
    } else {
      seen[key].lastSeen = now;
    }
  }

  saveSeen(seen);
  return added;
}

function isSeen(sourse, id) {
  const seen = loadSeen();
  const key = vacancyKeyByParts(sourse, id);
  return Boolean(seen[key]);
}

module.exports = {
  loadSeen,
  markSeen,
  isSeen,
};
