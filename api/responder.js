export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { context, question } = req.body;
  if (!context || !question) return res.status(400).json({ error: 'Missing context or question' });

  try {
    const prompt = `
Eres un asistente experto. Usa SOLO la información del contexto para responder.
Contexto:
${context}

Pregunta:
${question}
    `;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await geminiRes.json();
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    res.status(200).json({ answer: output });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate answer' });
  }
}
