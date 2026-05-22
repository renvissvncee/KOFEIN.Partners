import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { parseInitData, verifyTelegramHash } from '../services/telegramService.js';

export const login = async (req, res) => {
  try {
    const { initData, password, devTelegramId } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'password is required' });
    }

    let telegramId;
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    // Режим разработки: пропускаем проверку initData
    if (devTelegramId) {
      telegramId = devTelegramId;
    } else if (initData) {
      const parsedData = parseInitData(initData);
      
      if (!parsedData.user?.id) {
        return res.status(401).json({ error: 'Invalid initData: missing user' });
      }

      if (!verifyTelegramHash(parsedData, TELEGRAM_BOT_TOKEN)) {
        return res.status(401).json({ error: 'Invalid initData hash' });
      }

      telegramId = parsedData.user.id;
    } else {
      return res.status(400).json({ error: 'initData or devTelegramId is required' });
    }

    // Ищем пользователя в таблице users по telegram_id
    const userQuery = 'SELECT telegram_id, password_hash FROM users WHERE telegram_id = $1';
    const { rows } = await pool.query(userQuery, [telegramId]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = rows[0];

    // Сверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Получаем все кофейни где пользователь owner или staff
    const shopsQuery = `
      SELECT id, name, address, 'owner' as role FROM coffee_shops WHERE owners @> ARRAY[$1::integer]
      UNION ALL
      SELECT id, name, address, 'staff' as role FROM coffee_shops WHERE staff @> ARRAY[$1::integer]
    `;
    const { rows: shops } = await pool.query(shopsQuery, [telegramId]);

    if (shops.length === 0) {
      return res.status(401).json({ error: 'User has no coffee shop assigned' });
    }

    // Генерируем JWT
    const token = jwt.sign(
      { userId: String(telegramId) },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      shops: shops.map(s => ({ id: s.id, name: s.name, address: s.address, role: s.role }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const me = async (req, res) => {
  res.json({
    userId: req.user.userId,
    role: req.user.role,
    coffeeShopId: req.user.coffeeShopId
  });
};
