function buildSearchPath({
  page = 1,
  query = 'Программист',
  period = 4,
  exactMatch = 0,
  searchType = 'vacancy',
  alias = 'udalennaya-rabota-programmistom-vakansii',
} = {}) {
  const params = new URLSearchParams();

  params.set('search[exactMatch]', exactMatch);
  params.set('search[query]', query);
  params.set('search[searchType]', searchType);
  params.set('alias', alias);
  params.set('page', page);
  params.set('period', period);

  return `/search?${params.toString()}`;
}

module.exports = { buildSearchPath };
