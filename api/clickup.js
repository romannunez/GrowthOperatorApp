export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, payload, clickupToken } = req.body;

  if (!clickupToken) return res.status(400).json({ error: 'Missing ClickUp API token' });

  try {
    if (action === 'getTeams') {
      const response = await fetch('https://api.clickup.com/api/v2/team', {
        headers: { Authorization: clickupToken },
      });
      const data = await response.json();
      return res.status(200).json(data);
    }

    // Aquí podés agregar más acciones como crear space, listas, tareas, etc.

    res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'ClickUp API error' });
  }
}
