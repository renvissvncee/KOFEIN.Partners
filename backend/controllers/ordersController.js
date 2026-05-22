import { pool } from '../config/database.js';

export const getOrders = async (req, res) => {
  try {
    const { status, coffee_shop_id } = req.query;
    const params = [];
    const filters = [];

    if (coffee_shop_id) {
      params.push(coffee_shop_id);
      filters.push(`o.coffee_shop_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      filters.push(`o.status = $${params.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT
        o.id,
        o.telegram_id,
        o.coffee_shop_id,
        o.status,
        o.total_amount,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'name', COALESCE(mi.name, oi.menu_item_id::text),
              'quantity', oi.quantity,
              'unit_price', oi.unit_price
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
      ${where}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const { rows } = await pool.query(query, params);

    const result = rows.map((r) => ({
      id: r.id,
      telegram_id: r.telegram_id,
      coffee_shop_id: r.coffee_shop_id,
      time: r.created_at ? new Date(r.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : null,
      total_amount: r.total_amount,
      status: r.status,
      items: (r.items || []).map((it) => ({ name: it.name, quantity: it.quantity, unit_price: it.unit_price }))
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Missing status in body' });

    const update = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (update.rowCount === 0) return res.status(404).json({ error: 'Order not found' });

    res.json(update.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
