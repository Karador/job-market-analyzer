const axios = require('axios');

async function fetchHtml(path) {
  try {
    const response = await axios.get(`${path}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8'
      }
    });

    return response.data;
  } catch (error) {
    return null;
  }
}

module.exports = { fetchHtml };
