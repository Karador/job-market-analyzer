function buildVacanciesPath({
  page = 1,
  query,              // строка поиска
  specializations = [], // массив числовых ID (s[])
  type = 'all',       // all | office | remote
} = {}) {
  const params = new URLSearchParams();

  params.set('page', page);
  params.set('type', type);

  if (query) {
    params.set('q', query);
  }

  for (const spec of specializations) {
    params.append('s[]', spec);
  }

  return `/vacancies?${params.toString()}`;
}

module.exports = { buildVacanciesPath };
