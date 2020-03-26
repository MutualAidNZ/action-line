const axios = require('axios');

const instance = axios.create({
  baseURL:
    process.env.HERE_BASE_URL || 'https://geocode.search.hereapi.com/v1/',
  timeout: 5000
});

async function geocode(input) {
  try {
    const geocodeResult = await instance.get(
      `/geocode?q=${input},NZ&apiKey=${process.env.HERE_API_KEY}`
    );

    return geocodeResult.data.items[0].address;
  } catch (e) {
    console.error('Geocode error', e);
    return {};
  }
}

module.exports = {
  geocode
};
