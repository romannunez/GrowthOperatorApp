// api/razonar.js
const fetch = require('node-fetch');

const HRM_URL = process.env.HRM_URL; // ej: https://mi-hrm/reason

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { context, question } = req.body;
  if (!context || !question) return res.status(400).json({ error: 'Missing context or question' });

  try {
    const resp = await fetch(HRM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context, question })
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error('HRM service error', txt);
      return res.status(500).json({ error: 'HRM failed', details: txt });
    }

    const data = await resp.json();
    // Esperamos que HRM devuelva por ejemplo { plan: "...", steps: [...], answerDraft: "..." }
    res.status(200).json({ hrm: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'HRM call failed', details: err.message || err });
  }
};
