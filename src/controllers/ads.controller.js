import { query, getClient } from '../db/pool.js';

function mapAdRowToCard(row) {
  return {
    id: row.id,
    title: row.title,
    price: row.price !== null ? Number(row.price) : null,
    isFeatured: row.is_featured,
    imageUrl: row.image_url || null,
    createdAt: row.created_at,
    user: { id: row.user_id, fullName: row.user_full_name, avatarUrl: row.user_avatar_url },
    city: { id: row.city_id, name: row.city_name },
    category: { id: row.category_id, name: row.category_name, slug: row.category_slug },
  };
}

export async function listAds(req, res) {
  const { city, category, search, featured } = req.query;

  const filters = [];
  const params = [];

  filters.push("a.status = 'active'");

  if (featured === 'true') {
    filters.push('a.is_featured = TRUE');
  }

  if (city) {
    params.push(city);
    filters.push(`c.name = ?`);
  }

  if (category) {
    params.push(category);
    filters.push(`cat.slug = ?`);
  }

  if (search) {
    params.push(`%${search}%`);
    params.push(`%${search}%`);
    filters.push(`(a.title LIKE ? OR a.description LIKE ?)`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const sql = `
    SELECT a.id, a.title, a.price, a.is_featured, a.created_at,
           u.id as user_id, u.full_name as user_full_name, u.avatar_url as user_avatar_url,
           c.id as city_id, c.name as city_name,
           cat.id as category_id, cat.name as category_name, cat.slug as category_slug,
           COALESCE(
             (SELECT image_url FROM images WHERE advertisement_id = a.id AND is_thumbnail = TRUE ORDER BY id LIMIT 1),
             (SELECT image_url FROM images WHERE advertisement_id = a.id ORDER BY id LIMIT 1)
           ) as image_url
    FROM advertisements a
    JOIN users u ON u.id = a.user_id
    JOIN cities c ON c.id = a.city_id
    JOIN categories cat ON cat.id = a.category_id
    ${whereClause}
    ORDER BY a.created_at DESC
  `;

  const { rows } = await query(sql, params);
  return res.status(200).json(rows.map(mapAdRowToCard));
}

export async function getAdById(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const sql = `
    SELECT a.id, a.title, a.description, a.price, a.is_featured, a.created_at,
           u.id as user_id, u.full_name as user_full_name,
           c.id as city_id, c.name as city_name,
           cat.id as category_id, cat.name as category_name
    FROM advertisements a
    JOIN users u ON u.id = a.user_id
    JOIN cities c ON c.id = a.city_id
    JOIN categories cat ON cat.id = a.category_id
    WHERE a.id = ?
  `;
  const { rows } = await query(sql, [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  const ad = rows[0];

  const imagesRes = await query('SELECT image_url FROM images WHERE advertisement_id = ? ORDER BY id ASC', [id]);

  return res.status(200).json({
    id: ad.id,
    title: ad.title,
    description: ad.description,
    price: ad.price !== null ? Number(ad.price) : null,
    isFeatured: ad.is_featured,
    images: imagesRes.rows.map(r => r.image_url),
    createdAt: ad.created_at,
    user: { id: ad.user_id, fullName: ad.user_full_name },
    city: { id: ad.city_id, name: ad.city_name },
    category: { id: ad.category_id, name: ad.category_name },
  });
}

export async function createAd(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { title, description, price, categoryId, cityId, imageUrls } = req.body || {};
  if (!title || !description || !categoryId || !cityId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await getClient();
  try {
    await client.begin();
    const insertAd = `
      INSERT INTO advertisements (user_id, category_id, city_id, title, description, price)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await client.connection.execute(insertAd, [userId, categoryId, cityId, title, description, price ?? null]);
    const adId = result.insertId;

    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      const firstUrl = imageUrls[0];
      await client.query('INSERT INTO images (advertisement_id, image_url, is_thumbnail) VALUES (?, ?, TRUE)', [adId, firstUrl]);
      for (let i = 1; i < imageUrls.length; i += 1) {
        await client.query('INSERT INTO images (advertisement_id, image_url, is_thumbnail) VALUES (?, ?, FALSE)', [adId, imageUrls[i]]);
      }
    }

    await client.commit();

    req.params.id = String(adId);
    return getAdById(req, res);
  } catch (err) {
    await client.rollback();
    return res.status(500).json({ error: 'Failed to create advertisement' });
  } finally {
    client.release();
  }
}

export async function deleteAd(req, res) {
  const userId = req.user?.id;
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { rows } = await query('SELECT user_id FROM advertisements WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  if (rows[0].user_id !== userId) return res.status(403).json({ error: 'Forbidden' });

  await query('DELETE FROM advertisements WHERE id = ?', [id]);
  return res.status(204).send();
}

export async function listMyAds(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const sql = `
    SELECT a.id, a.title, a.price, a.is_featured, a.created_at,
           u.id as user_id, u.full_name as user_full_name, u.avatar_url as user_avatar_url,
           c.id as city_id, c.name as city_name,
           cat.id as category_id, cat.name as category_name, cat.slug as category_slug,
           COALESCE(
             (SELECT image_url FROM images WHERE advertisement_id = a.id AND is_thumbnail = TRUE ORDER BY id LIMIT 1),
             (SELECT image_url FROM images WHERE advertisement_id = a.id ORDER BY id LIMIT 1)
           ) as image_url
    FROM advertisements a
    JOIN users u ON u.id = a.user_id
    JOIN cities c ON c.id = a.city_id
    JOIN categories cat ON cat.id = a.category_id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `;
  const { rows } = await query(sql, [userId]);
  return res.status(200).json(rows.map(mapAdRowToCard));
}
