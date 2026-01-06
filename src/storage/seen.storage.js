const fs = require('fs');
const paths = require('../config/paths');

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

function markSeen(vacancies, source) {
  const seen = loadSeen();
  const now = new Date().toISOString();

  let added = 0;

  for (const v of vacancies) {
    const id = v?.id || v?.vacancy?.id;
    if (!id) continue;

    if (!seen[id]) {
      seen[id] = {
        firstSeen: now,
        lastSeen: now,
        source,
      };
      added++;
    } else {
      seen[id].lastSeen = now;
    }
  }

  saveSeen(seen);
  return added;
}

function isSeen(id) {
  const seen = loadSeen();
  return Boolean(seen[id]);
}

module.exports = {
  loadSeen,
  markSeen,
  isSeen,
};
