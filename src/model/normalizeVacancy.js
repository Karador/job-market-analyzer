const CURRENCY_MAP = {
  USD: [/\$/, /\bUSD\b/i],
  EUR: [/€/, /\bEUR\b/i],
  RUB: [/₽/, /\bруб\.?\b/i, /\bрублей\b/i, /\bRUB\b/i],
  BYN: [/\bBr\b/i, /\bBYN\b/i],
};

const NUMBER_RE = /\d[\d\s ]*/g; // обычные + неразрывные пробелы

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function normalizeNumber(str) {
  return Number(str.replace(/[^\d]/g, ""));
}

function extractSalary(text) {
  if (!text) return { from: null, to: null, currency: null };

  const numbers = text.match(NUMBER_RE);
  if (!numbers || numbers.length < 2) {
    return { from: null, to: null, currency: null };
  }

  const from = normalizeNumber(numbers[0]);
  const to = normalizeNumber(numbers[1]);

  let currency = null;
  for (const [code, patterns] of Object.entries(CURRENCY_MAP)) {
    if (patterns.some(re => re.test(text))) {
      currency = code;
      break;
    }
  }

  if (!currency) {
    return { from: null, to: null, currency: null };
  }

  return { from, to, currency };
}

function extractId(link) {
  const match = link?.match(/\/show\/(\d+)/);
  return match ? match[1] : null;
}

function normalizeHH(raw) {
  const v = raw;

  const title = cleanText(v.title);
  const description = cleanText(v.snippetReq + v.snippetResp + v.snippetCond + v.snippetSkills);

  const text = [
    title,
    description,
    v.experience || '',
  ].join('\n');

  return {
    id: v.id,
    title,
    company: cleanText(v.company),
    text,
    salary: v.compensation,

    meta: {
      source: 'hh',
      link: v.link,
      experience: v.experience || null,
      remote: v.workSchedule === 'remote',
    }
  };
}

function normalizeHabr(raw) {
  const v = raw.vacancy;

  const title = cleanText(v.title);

  const text = [
    title,
    ...(v.skills || []),
    v.meta.experience || ''
  ].join('\n');

  return {
    id: v.id,
    title,
    company: cleanText(v.company?.name),
    text,
    salary: extractSalary(v.salary),
    skills: v.skills || [],

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
