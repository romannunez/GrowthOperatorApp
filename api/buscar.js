// api/buscar.js
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY; // lectura
const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = process.env.HF_EMBED_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    // 1) Generar embedding con HF
    const hfResp = await fetch(`https://api-inference.huggingface.co/feature-extraction/${HF_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    });

    if (!hfResp.ok) {
      const txt = await hfResp.text();
      console.error('HF error', txt);
      return res.status(500).json({ error: 'HuggingFace embedding failed', details: txt });
    }

    const emb = await hfResp.json(); // usually [ [ ...vector ] ] or just [ ... ]
    // normalize shape: take first vector if nested
    const qEmbedding = Array.isArray(emb[0]) ? emb[0] : emb;

    // 2) Llamar a la RPC match_documents en Supabase
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: qEmbedding,
      match_threshold: Number(process.env.SUPABASE_MATCH_THRESHOLD || 0.78),
      match_count: Number(process.env.SUPABASE_MATCH_COUNT || 6)
    });

    if (error) throw error;

    // 3) Devolver fragments ordenados
    res.status(200).json({ results: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed', details: err.message || err });
  }
};
