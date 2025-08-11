import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, metadata } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    // Generar embeddings con modelo gratuito de Hugging Face
    const hfRes = await fetch("https://api-inference.huggingface.co/feature-extraction/sentence-transformers/all-MiniLM-L6-v2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(text)
    });

    const embedding = await hfRes.json();

    // Guardar en Supabase
    const { data, error } = await supabase.from('documents').insert([
      { content: text, metadata, embedding }
    ]);

    if (error) throw error;
    res.status(200).json({ message: 'Indexed successfully', data });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to index text' });
  }
}
