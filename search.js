// api/search.js — Vercel serverless function (Node.js)
const fetch = require('node-fetch');

module.exports = async (request, response) => {
  const query = (request.query && request.query.q) || (request.url && new URL(request.url, 'https://example.com').searchParams.get('q')) || 'islam';
  const apiKey = process.env.API_KEY;
  const searchEngineId = process.env.CX;

  if (!apiKey || !searchEngineId) {
    console.error('Missing API_KEY or CX environment variables.');
    return response.status(500).json({ error: 'Missing API credentials.' });
  }

  const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;

  try {
    const fetchResponse = await fetch(apiUrl);
    const data = await fetchResponse.json();
    if (!data) {
      console.error('Empty response from Google API');
      return response.status(500).json({ error: 'Empty response from Google API' });
    }
    response.status(200).json(data);
  } catch (error) {
    console.error('Error in /api/search:', error);
    response.status(500).json({ error: 'Failed to fetch search results.' });
  }
};
