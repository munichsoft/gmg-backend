import { getAuth } from '../config/firebase.js';
import { query } from '../db/pool.js';

export async function syncFirebaseUser(req, res) {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: 'token is required' });

    const decoded = await getAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const email = decoded.email || null;
    const fullName = decoded.name || '';
    const avatarUrl = decoded.picture || null;

    const upsertSql = `
      INSERT INTO users (id, email, full_name, avatar_url)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE email = VALUES(email), full_name = VALUES(full_name), avatar_url = VALUES(avatar_url)
    `;
    await query(upsertSql, [uid, email, fullName, avatarUrl]);
    
    // Get the updated/inserted user
    const { rows } = await query('SELECT id, email, full_name AS fullName, avatar_url AS avatarUrl, created_at AS createdAt FROM users WHERE id = ?', [uid]);
    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
