const fs = require('fs');
const readline = require('readline');
const { vacancies, rescoredVacancies } = require('../config/paths');
const { rankByQuantiles } = require('../score/ranker')

/**
 * Сохраняет новые вакансии, считает ранк относительно существующих
 */
async function saveVacancies(newVacancies) {
  // 1. Загружаем существующие вакансии
  const existingVacancies = await loadVacancies();
  const existingIds = new Set(existingVacancies.map(v => v?.vacancy?.id));

  // 2. Отбираем только новые, которые ещё нет
  const toSave = newVacancies.filter(v => v?.vacancy?.id && !existingIds.has(v.vacancy.id));

  // 3. Объединяем со старым массивом для ранка
  const combined = [...existingVacancies, ...toSave];

  // 4. Вычисляем ранк
  rankByQuantiles(combined);

  // 5. Сохраняем только новые вакансии
  const stream = fs.createWriteStream(vacancies, { flags: 'a' });
  const now = new Date().toISOString();
  let saved = 0;

  for (const v of toSave) {
    stream.write(JSON.stringify({
      ...v,
      meta: { savedAt: now }
    }) + '\n');
    saved++;
  }

  stream.end();
  return saved;
}

async function saveSnapshot(scoredVacancies) {
  rankByQuantiles(scoredVacancies);

  const stream = fs.createWriteStream(rescoredVacancies, { flags: 'w' });
  const now = new Date().toISOString();
  let saved = 0;

  for (const v of scoredVacancies) {
    stream.write(JSON.stringify({
      ...v,
      meta: { savedAt: now }
    }) + '\n');
    saved++;
  }

  stream.end();
  return saved;
}

async function loadVacancies(path = vacancies) {
  const result = [];

  if (!fs.existsSync(path)) {
    return result;
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(path),
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

module.exports = { saveVacancies, saveSnapshot, loadVacancies };
