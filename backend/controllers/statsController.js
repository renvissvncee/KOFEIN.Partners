import { pool } from '../config/database.js';

export const getDailyStats = async (req, res) => {
  try {
    const { coffee_shop_id } = req.query;
    
    if (!coffee_shop_id) {
      return res.status(400).json({ error: 'coffee_shop_id is required' });
    }

    // Получаем статистику за текущий день (все заказы)
    const query = `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders
      WHERE coffee_shop_id = $1
        AND DATE(created_at) = CURRENT_DATE
    `;

    const { rows } = await pool.query(query, [coffee_shop_id]);
    
    res.json({
      totalOrders: parseInt(rows[0].total_orders) || 0,
      totalRevenue: parseFloat(rows[0].total_revenue) || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
