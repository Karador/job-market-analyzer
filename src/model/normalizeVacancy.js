function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function extractSalary(text) {
  if (!text) return { from: null, to: null, currency: null };

  const match = text.match(/от\s*([\d\s]+)\s*до\s*([\d\s]+)\s*(руб|₽)/i);
  if (!match) return { from: null, to: null, currency: null };

  return {
    from: Number(match[1].replace(/\s/g, '')),
    to: Number(match[2].replace(/\s/g, '')),
    currency: 'RUB'
  };
}

function extractId(link) {
  const match = link?.match(/\/show\/(\d+)/);
  return match ? match[1] : null;
}

function normalizeVacancy(raw) {
  const title = cleanText(raw.title);
  const company = cleanText(raw.company);
  const description = cleanText(raw.description);

  const text = `${title}\n${description}`;

  return {
    id: extractId(raw.link),
    title,
    company,
    text,
    salary: extractSalary(description),
    meta: {
      source: 'remote-job',
      link: raw.link
    }
  };
}

module.exports = { normalizeVacancy };
