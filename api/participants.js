// Simple in‑memory storage – perfect for a single event
let participants = [];
let winner = null;

export default async function handler(req, res) {
  // Enable CORS so your frontend can call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET – return current participants and winner
    if (req.method === 'GET') {
      const obj = {};
      participants.forEach((p, i) => { obj[i] = p; });
      return res.status(200).json({
        participants: obj,
        count: participants.length,
        winner: winner
      });
    }

    // POST – register a new participant
    if (req.method === 'POST') {
      const { name, timestamp } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      participants.push({ name: name.trim(), timestamp: timestamp || Date.now() });
      return res.status(201).json({ name });
    }

    // PUT – draw winner (admin only)
    if (req.method === 'PUT') {
      const adminKey = req.headers['x-admin-key'];
      if (adminKey !== 'admin123') {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (participants.length === 0) {
        return res.status(400).json({ error: 'No participants yet' });
      }
      const randomIndex = Math.floor(Math.random() * participants.length);
      winner = participants[randomIndex].name;
      // Clear participants for the next round
      participants = [];
      return res.status(200).json({ winner });
    }

    // DELETE – reset everything (admin only)
    if (req.method === 'DELETE') {
      const adminKey = req.headers['x-admin-key'];
      if (adminKey !== 'admin123') {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      participants = [];
      winner = null;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
