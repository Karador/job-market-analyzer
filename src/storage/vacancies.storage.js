const fs = require('fs');
const readline = require('readline');
const { vacancies } = require('../config/paths');
const { rankByQuantiles } = require('../score/ranker')

/**
 * Вычисляет ранк вакансий относительно других по total score
 */
function computeRanks(allVacancies) {
  // сортируем по score
  allVacancies.sort((a, b) => b.scores.total - a.scores.total);

  // присваиваем rank от 1 (лучший) до N
  allVacancies.forEach((v, index) => {
    v.rank = index + 1;
  });
}

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
