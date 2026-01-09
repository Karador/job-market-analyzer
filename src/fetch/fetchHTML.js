const axios = require('axios');

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

async function fetchHtml(url, options = {}) {
  const {
    referer,
    headers = {},
  } = options;

  try {
    const response = await axios.get(url, {
      timeout: 20000,
      headers: {
        ...DEFAULT_HEADERS,
        ...(referer ? { Referer: referer } : {}),
        ...headers,
      },
      validateStatus: status => status < 500,
    });

    if (response.status !== 200) {
      console.log(`[fetchHtml] ${response.status} ${url}`);
      return null;
    }

    return response.data;
  } catch (error) {
    console.log('[fetchHtml error]', error.message);
    return null;
  }
}

module.exports = { fetchHtml };
