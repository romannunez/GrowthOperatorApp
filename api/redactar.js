// api/redactar.js
const fetch = require('node-fetch');
const GEMINI_KEY = process.env.GEMINI_API_KEY;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { hrmOutput, tone } = req.body;
  if (!hrmOutput) return res.status(400).json({ error: 'Missing hrmOutput' });

  try {
    // Construir prompt que le pasemos a Gemini
    const prompt = `Eres un asistente. Convierte el siguiente razonamiento en una respuesta clara para un usuario.
Tono: ${tone || 'formal pero amigable'}

Razonamiento:
${JSON.stringify(hrmOutput, null, 2)}

Por favor devuelve solo el texto final en "finalAnswer".`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      // puedes ajustar temperature / maxOutputTokens según tus límites
      // example (opcional):
      // temperature: 0.2,
    };

    const gResp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const gData = await gResp.json();
    const text = gData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    res.status(200).json({ answer: text, raw: gData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gemini call failed', details: err.message || err });
  }
};
