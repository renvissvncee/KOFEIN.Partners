import { pool } from '../config/database.js';

export const getMenu = async (req, res) => {
  try {
    const { coffee_shop_id } = req.query;
    
    if (!coffee_shop_id) {
      return res.status(400).json({ error: 'coffee_shop_id is required' });
    }

    const query = `
      SELECT id, name, description, base_price as price, is_available as available
      FROM menu_items
      WHERE coffee_shop_id = $1
      ORDER BY name
    `;

    const { rows } = await pool.query(query, [coffee_shop_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const { coffee_shop_id, name, description, price, available } = req.body;
    
    if (!coffee_shop_id || !name || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO menu_items (coffee_shop_id, name, description, base_price, is_available)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, description, base_price as price, is_available as available
    `;

    const { rows } = await pool.query(query, [coffee_shop_id, name, description || '', price, available !== false]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, available } = req.body;

    const query = `
      UPDATE menu_items
      SET name = $1, description = $2, base_price = $3, is_available = $4
      WHERE id = $5
      RETURNING id, name, description, base_price as price, is_available as available
    `;

    const { rows } = await pool.query(query, [name, description || '', price, available !== false, id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM menu_items WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
