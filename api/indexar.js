import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, metadata } = req.body;

  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text,
    });

    const embedding = embeddingResponse.data[0].embedding;

    const { data, error } = await supabase.from('documents').insert([
      {
        content: text,
        metadata,
        embedding,
      },
    ]);

    if (error) throw error;

    res.status(200).json({ message: 'Indexed successfully', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to index text' });
  }
}
