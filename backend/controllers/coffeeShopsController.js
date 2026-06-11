import { pool } from '../config/database.js';

export const getCoffeeShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT id, name, address, opening_time, closing_time FROM coffee_shops WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Coffee shop not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCoffeeShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, opening_time, closing_time } = req.body;
    const { rows } = await pool.query(
      'UPDATE coffee_shops SET name = $1, address = $2, opening_time = $3, closing_time = $4 WHERE id = $5 RETURNING id, name, address, opening_time, closing_time',
      [name, address, opening_time || null, closing_time || null, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Coffee shop not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStaff = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Получаем staff массив кофейни
    const shopQuery = 'SELECT staff FROM coffee_shops WHERE id = $1';
    const { rows: shopRows } = await pool.query(shopQuery, [id]);
    
    if (shopRows.length === 0) {
      return res.status(404).json({ error: 'Coffee shop not found' });
    }

    const staffIds = shopRows[0].staff || [];
    
    if (staffIds.length === 0) {
      return res.json([]);
    }

    // Получаем информацию о сотрудниках
    const usersQuery = 'SELECT telegram_id, phone, created_at FROM users WHERE telegram_id = ANY($1)';
    const { rows } = await pool.query(usersQuery, [staffIds]);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { telegramId } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId is required' });
    }

    // Проверить что пользователь существует
    const userQuery = 'SELECT telegram_id FROM users WHERE telegram_id = $1';
    const { rows: userRows } = await pool.query(userQuery, [telegramId]);
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Добавить в staff (исключаем дубликаты)
    const updateQuery = `
      UPDATE coffee_shops 
      SET staff = (SELECT array_agg(DISTINCT unnest) FROM unnest(staff || ARRAY[$1::integer])) 
      WHERE id = $2 
      RETURNING staff
    `;
    const { rows } = await pool.query(updateQuery, [telegramId, id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Coffee shop not found' });
    }

    res.json({ success: true, staff: rows[0].staff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeStaff = async (req, res) => {
  try {
    const { id, telegramId } = req.params;

    // Удалить из staff
    const updateQuery = 'UPDATE coffee_shops SET staff = array_remove(staff, $1::integer) WHERE id = $2 RETURNING staff';
    const { rows } = await pool.query(updateQuery, [telegramId, id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Coffee shop not found' });
    }

    res.json({ success: true, staff: rows[0].staff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
