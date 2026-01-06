const fs = require('fs');
const readline = require('readline');
const { vacancies } = require('../config/paths');

async function loadExistingIds() {
  const ids = new Set();

  if (!fs.existsSync(vacancies)) {
    return ids;
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(vacancies),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const item = JSON.parse(line);
      if (item?.vacancy?.id) {
        ids.add(item.vacancy.id);
      }
    } catch {
      // битая строка — игнорируем
    }
  }

  return ids;
}

async function saveVacancies(scoredVacancies) {
  const existingIds = await loadExistingIds();
  const stream = fs.createWriteStream(vacancies, { flags: 'a' });

  let saved = 0;

  for (const v of scoredVacancies) {
    const id = v?.vacancy?.id;
    if (!id || existingIds.has(id)) continue;

    stream.write(
      JSON.stringify({
        ...v,
        meta: { savedAt: new Date().toISOString() }
      }) + '\n'
    );

    saved++;
  }

  stream.end();
  return saved;
}

async function loadVacancies() {
  const result = [];

  if (!fs.existsSync(vacancies)) {
    return result;
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(vacancies),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      result.push(JSON.parse(line));
    } catch {
      // пропускаем битые строки
    }
  }

  return result;
}

module.exports = { saveVacancies, loadVacancies };
