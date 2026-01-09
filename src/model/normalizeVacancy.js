const { normalizeTechnologies } = require('../analysis/techNormalizer');

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

function normalizeHH(raw) {
  const v = raw;

  const title = cleanText(v.title);
  const description = cleanText(v.description);

  const text = [
    title,
    description,
  ].join('\n');

  return {
    id: v.id,
    title,
    company: cleanText(v.company),
    text,
    salary: { from: null, to: null, currency: null },
    tech: normalizeTechnologies(text),

    meta: {
      source: 'hh',
      link: v.link,
      experience: v.experience || null,
      remote: v.isRemote,
    }
  };
}

function normalizeHabr(raw) {
  const v = raw.vacancy;

  const title = cleanText(v.title);

  const text = [
    title,
    ...(v.skills || [])
  ].join('\n');

  return {
    id: v.id,
    title,
    company: cleanText(v.company?.name),
    text,
    salary: { from: null, to: null, currency: null },
    skills: v.skills || [],
    tech: normalizeTechnologies(text),

    meta: {
      source: 'habr-career',
      link: v.meta.link,
      experience: v.meta.experience || null,
      remote: Boolean(v.meta.remote),
      employment: v.meta.employment || null,
      date: v.date || null,
      companyRating: v.company?.rating ?? null,
    }
  };
}

function normalizeRemoteJob(raw) {
  const title = cleanText(raw.title);
  const company = cleanText(raw.company);
  const description = cleanText(raw.description);

  const text = `${title}\n${description}`;

  const remote = /удалённ/i.test(text) || /удаленн/i.test(text);

  return {
    id: extractId(raw.link),
    title,
    company,
    text,
    salary: extractSalary(description),
    tech: normalizeTechnologies(text),
    meta: {
      source: 'remote-job',
      link: raw.link,
      remote
    }
  };
}

function normalizeVacancy(raw) {
  if (raw.source === 'remote-job') {
    return normalizeRemoteJob(raw);
  }

  if (raw.source === 'habr-career') {
    return normalizeHabr(raw);
  }

  if (raw.source === 'hh') {
    return normalizeHH(raw);
  }

  throw new Error(`Unknown source: ${raw.source}`);
}

module.exports = { normalizeVacancy };
