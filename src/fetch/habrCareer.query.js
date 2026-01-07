function buildVacanciesPath({
  page = 1,
  q,
  salary,
  remote,
  experience,      // junior / middle / senior
  employment,      // full_time / part_time / project
  skills = [],
  locations = [],

} = {}) {
  const params = new URLSearchParams();

  params.set('page', page);

  if (q) params.set('q', q);
  if (salary) params.set('salary', salary);
  if (remote) params.set('remote', 'true');
  if (experience) params.set('experience', experience);
  if (employment) params.set('employment', employment);

  for (const skill of skills) {
    params.append('skills[]', skill);
  }

  for (const location of locations) {
    params.append('locations[]', location);
  }

  return `/vacancies?${params.toString()}`;
}

module.exports = { buildVacanciesPath };
