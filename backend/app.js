import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import ordersRoutes from './routes/ordersRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import coffeeShopsRoutes from './routes/coffeeShopsRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/orders', ordersRoutes);
app.use('/menu', menuRoutes);
app.use('/coffee-shops', coffeeShopsRoutes);
app.use('/api/stats', statsRoutes);

// Запуск сервера только если этот файл запущен напрямую
const port = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`API listening on ${port}`));
}

export default app;

