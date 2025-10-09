// api/ask.js — Vercel serverless function (Node.js) using Google Generative AI SDK
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (request, response) => {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const { question } = request.body || {};
    const prompt = `As an Islamic knowledge assistant, answer respectfully and concisely:\n\n${question}`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const text = result.response?.text?.() || '';

    response.status(200).json({ answer: text });
  } catch (error) {
    console.error('Error in /api/ask:', error);
    response.status(500).json({ error: error.message || 'Unknown error' });
  }
};
