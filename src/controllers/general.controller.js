import { query } from '../db/pool.js';

export async function listCities(req, res) {
  try {
    const { rows } = await query('SELECT id, name FROM cities ORDER BY name ASC');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return res.status(500).json({ error: 'Database connection failed', code: error.code });
  }
}

export async function listCategories(req, res) {
  try {
    const { rows } = await query('SELECT id, name, slug FROM categories ORDER BY name ASC');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Database connection failed', code: error.code });
  }
}
