import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn()
}));

// Mock database
jest.mock('../config/database.js', () => ({
  pool: {
    query: jest.fn()
  }
}));

import { pool } from '../config/database.js';
import * as authController from '../controllers/authController.js';
import * as ordersController from '../controllers/ordersController.js';
import * as menuController from '../controllers/menuController.js';
import * as coffeeShopsController from '../controllers/coffeeShopsController.js';
import * as statsController from '../controllers/statsController.js';

// Helper для создания mock response
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Auth Controller', () => {
  const mockReq = (body = {}) => ({ body });

  describe('login', () => {
    test('должен вернуть 400 без password', async () => {
      const req = mockReq({ devTelegramId: 123 });
      const res = mockRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'password is required' });
    });

    test('должен вернуть 400 без initData или devTelegramId', async () => {
      const req = mockReq({ password: 'test' });
      const res = mockRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'initData or devTelegramId is required' });
    });

    test('должен вернуть 401 если пользователь не найден', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const req = mockReq({ devTelegramId: 123, password: 'test' });
      const res = mockRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    test('должен вернуть 401 если пользователь не назначен в кофейню', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ telegram_id: 123, password_hash: 'hash' }] })
        .mockResolvedValueOnce({ rows: [] });

      const req = mockReq({ devTelegramId: 123, password: 'test' });
      const res = mockRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'User has no coffee shop assigned' });
    });

    test('должен вернуть 401 при неверном пароле', async () => {
      const bcrypt = await import('bcryptjs');
      bcrypt.compare.mockResolvedValueOnce(false);

      pool.query.mockResolvedValueOnce({ rows: [{ telegram_id: 123, password_hash: 'hash' }] });

      const req = mockReq({ devTelegramId: 123, password: 'wrong' });
      const res = mockRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid password' });
    });

    test('должен вернуть успешный ответ с токеном и кофейнями', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ telegram_id: 123, password_hash: 'hash' }] })
        .mockResolvedValueOnce({ 
          rows: [
            { id: 'shop-1', name: 'Shop 1', address: 'Addr 1', role: 'owner' },
            { id: 'shop-2', name: 'Shop 2', address: 'Addr 2', role: 'staff' }
          ] 
        });

      const req = mockReq({ devTelegramId: 123, password: 'test' });
      const res = mockRes();

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        token: 'mock-token',
        shops: [
          { id: 'shop-1', name: 'Shop 1', address: 'Addr 1', role: 'owner' },
          { id: 'shop-2', name: 'Shop 2', address: 'Addr 2', role: 'staff' }
        ]
      });
    });

    test('должен вернуть 401 при invalid initData', async () => {
      const req = mockReq({ initData: 'invalid', password: 'test' });
      const res = mockRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid initData: missing user' });
    });

    test('должен вернуть 401 при invalid initData hash', async () => {
      const telegramService = await import('../services/telegramService.js');
      jest.spyOn(telegramService, 'verifyTelegramHash').mockReturnValue(false);

      const user = { id: 123, first_name: 'Test' };
      const initData = `user=${encodeURIComponent(JSON.stringify(user))}&auth_date=1234567890&hash=invalid`;
      
      const req = mockReq({ initData, password: 'test' });
      const res = mockRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid initData hash' });
    });

    test('должен вернуть 500 при ошибке сервера', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({ devTelegramId: 123, password: 'test' });
      const res = mockRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('me', () => {
    test('должен вернуть данные пользователя из req.user', () => {
      const req = { 
        user: { 
          userId: 'user-123', 
          role: 'owner', 
          coffeeShopId: 'shop-1' 
        } 
      };
      const res = mockRes();

      authController.me(req, res);

      expect(res.json).toHaveBeenCalledWith({
        userId: 'user-123',
        role: 'owner',
        coffeeShopId: 'shop-1'
      });
    });

    test('должен вернуть 401 если нет req.user', () => {
      const req = {};
      const res = mockRes();

      authController.me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });
});

describe('Orders Controller', () => {
  const mockReq = (query = {}, params = {}) => ({ query, params });

  describe('getOrders', () => {
    test('должен вернуть все заказы без фильтров', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const req = mockReq();
      const res = mockRes();

      await ordersController.getOrders(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('должен вернуть заказы с данными', async () => {
      const mockRows = [{
        id: 'order-1',
        telegram_id: 123,
        coffee_shop_id: 'shop-1',
        status: 'New',
        total_amount: 500,
        created_at: new Date('2024-01-01T10:00:00Z'),
        items: [{ name: 'Coffee', quantity: 2, unit_price: 250 }]
      }];
      pool.query.mockResolvedValueOnce({ rows: mockRows });

      const req = mockReq();
      const res = mockRes();

      await ordersController.getOrders(req, res);

      expect(res.json).toHaveBeenCalled();
    });

    test('должен фильтровать по coffee_shop_id', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const req = mockReq({ coffee_shop_id: 'shop-id' });
      const res = mockRes();

      await ordersController.getOrders(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('coffee_shop_id = $1'),
        ['shop-id']
      );
    });

    test('должен фильтровать по статусу', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const req = mockReq({ status: 'New' });
      const res = mockRes();

      await ordersController.getOrders(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('status = $1'),
        ['New']
      );
    });

    test('должен фильтровать по обоим параметрам', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const req = mockReq({ coffee_shop_id: 'shop-1', status: 'Preparing' });
      const res = mockRes();

      await ordersController.getOrders(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['shop-1', 'Preparing'])
      );
    });
  });

  describe('updateOrderStatus', () => {
    test('должен вернуть 400 без status', async () => {
      const req = { params: { id: 'order-id' }, body: {} };
      const res = mockRes();

      await ordersController.updateOrderStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing status in body' });
    });

    test('должен вернуть 404 если заказ не найден', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const req = { params: { id: 'order-id' }, body: { status: 'Preparing' } };
      const res = mockRes();

      await ordersController.updateOrderStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Order not found' });
    });

    test('должен обновить статус заказа', async () => {
      pool.query.mockResolvedValueOnce({ 
        rowCount: 1, 
        rows: [{ id: 'order-id', status: 'Preparing' }] 
      });

      const req = { params: { id: 'order-id' }, body: { status: 'Preparing' } };
      const res = mockRes();

      await ordersController.updateOrderStatus(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: 'order-id', status: 'Preparing' });
    });

    test('должен обработать ошибку сервера', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const req = { params: { id: 'order-id' }, body: { status: 'Preparing' } };
      const res = mockRes();

      await ordersController.updateOrderStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});

describe('Menu Controller', () => {
  const mockReq = (query = {}, body = {}, params = {}) => ({ query, body, params });

  describe('getMenu', () => {
    test('должен вернуть 400 без coffee_shop_id', async () => {
      const req = mockReq();
      const res = mockRes();

      await menuController.getMenu(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'coffee_shop_id is required' });
    });

    test('должен вернуть меню кофейни', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const req = mockReq({ coffee_shop_id: 'shop-id' });
      const res = mockRes();

      await menuController.getMenu(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('должен вернуть меню с товарами', async () => {
      const mockRows = [
        { id: 'item-1', name: 'Coffee', description: 'Hot coffee', price: 200, available: true },
        { id: 'item-2', name: 'Tea', description: 'Green tea', price: 150, available: true }
      ];
      pool.query.mockResolvedValueOnce({ rows: mockRows });

      const req = mockReq({ coffee_shop_id: 'shop-id' });
      const res = mockRes();

      await menuController.getMenu(req, res);

      expect(res.json).toHaveBeenCalledWith(mockRows);
    });
  });

  describe('createMenuItem', () => {
    test('должен вернуть 400 без coffee_shop_id', async () => {
      const req = mockReq({}, { name: 'Test', price: 100 });
      const res = mockRes();

      await menuController.createMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    test('должен вернуть 400 без name', async () => {
      const req = mockReq({}, { coffee_shop_id: 'shop-1', price: 100 });
      const res = mockRes();

      await menuController.createMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    test('должен вернуть 400 без price', async () => {
      const req = mockReq({}, { coffee_shop_id: 'shop-1', name: 'Test' });
      const res = mockRes();

      await menuController.createMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    test('должен создать товар меню', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'item-id', name: 'Test', description: '', price: 100, available: true }]
      });

      const req = mockReq({}, {
        coffee_shop_id: 'shop-id',
        name: 'Test',
        price: 100,
        available: true
      });
      const res = mockRes();

      await menuController.createMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'item-id', name: 'Test', price: 100 })
      );
    });

    test('должен создать товар с available=false по умолчанию', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'item-id', name: 'Test', price: 100, available: false }]
      });

      const req = mockReq({}, {
        coffee_shop_id: 'shop-id',
        name: 'Test',
        price: 100
      });
      const res = mockRes();

      await menuController.createMenuItem(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('is_available'),
        expect.arrayContaining(['shop-id', 'Test', '', 100, true])
      );
    });
  });

  describe('updateMenuItem', () => {
    test('должен вернуть 404 если товар не найден', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const req = mockReq({}, { name: 'Updated' }, { id: 'item-id' });
      const res = mockRes();

      await menuController.updateMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Menu item not found' });
    });

    test('должен обновить товар меню', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'item-id', name: 'Updated', description: 'New desc', price: 150, available: true }]
      });

      const req = mockReq({}, { name: 'Updated', description: 'New desc', price: 150 }, { id: 'item-id' });
      const res = mockRes();

      await menuController.updateMenuItem(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'item-id', name: 'Updated' })
      );
    });
  });

  describe('deleteMenuItem', () => {
    test('должен вернуть 404 если товар не найден', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const req = mockReq({}, {}, { id: 'item-id' });
      const res = mockRes();

      await menuController.deleteMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Menu item not found' });
    });

    test('должен удалить товар', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      const req = mockReq({}, {}, { id: 'item-id' });
      const res = mockRes();

      await menuController.deleteMenuItem(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('Menu Error Handling', () => {
    test('getMenu должен обработать ошибку сервера', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({ coffee_shop_id: 'shop-id' });
      const res = mockRes();

      await menuController.getMenu(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    test('createMenuItem должен обработать ошибку сервера', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({}, { coffee_shop_id: 'shop-1', name: 'Test', price: 100 });
      const res = mockRes();

      await menuController.createMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    test('updateMenuItem должен обработать ошибку сервера', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({}, { name: 'Updated' }, { id: 'item-id' });
      const res = mockRes();

      await menuController.updateMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    test('deleteMenuItem должен обработать ошибку сервера', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({}, {}, { id: 'item-id' });
      const res = mockRes();

      await menuController.deleteMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});

describe('Coffee Shops Controller', () => {
  const mockReq = (params = {}, body = {}) => ({ params, body });

  describe('getCoffeeShop', () => {
    test('должен вернуть 404 если кофейня не найдена', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const req = mockReq({ id: 'shop-id' });
      const res = mockRes();

      await coffeeShopsController.getCoffeeShop(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Coffee shop not found' });
    });

    test('должен вернуть кофейню', async () => {
      pool.query.mockResolvedValueOnce({ 
        rows: [{ id: 'shop-id', name: 'Test Shop', address: 'Test Address', opening_time: '09:00', closing_time: '21:00' }]
      });

      const req = mockReq({ id: 'shop-id' });
      const res = mockRes();

      await coffeeShopsController.getCoffeeShop(req, res);

      expect(res.json).toHaveBeenCalledWith({
        id: 'shop-id',
        name: 'Test Shop',
        address: 'Test Address',
        opening_time: '09:00',
        closing_time: '21:00'
      });
    });
  });

  describe('updateCoffeeShop', () => {
    test('должен вернуть 404 если кофейня не найдена', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const req = mockReq({ id: 'shop-id' }, { name: 'Updated' });
      const res = mockRes();

      await coffeeShopsController.updateCoffeeShop(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Coffee shop not found' });
    });

    test('должен обновить кофейню', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'shop-id', name: 'Updated', address: 'New Addr', opening_time: '10:00', closing_time: '22:00' }]
      });

      const req = mockReq({ id: 'shop-id' }, { 
        name: 'Updated', 
        address: 'New Addr',
        opening_time: '10:00',
        closing_time: '22:00'
      });
      const res = mockRes();

      await coffeeShopsController.updateCoffeeShop(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'shop-id', name: 'Updated' })
      );
    });
  });

  describe('getStaff', () => {
    test('должен вернуть 404 если кофейня не найдена', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const req = mockReq({ id: 'shop-id' });
      const res = mockRes();

      await coffeeShopsController.getStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Coffee shop not found' });
    });

    test('должен вернуть пустой список если нет сотрудников', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ staff: [] }] });

      const req = mockReq({ id: 'shop-id' });
      const res = mockRes();

      await coffeeShopsController.getStaff(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('должен вернуть список сотрудников', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ staff: [123, 456] }] })
        .mockResolvedValueOnce({ 
          rows: [
            { telegram_id: 123, phone: '+7123', created_at: new Date() },
            { telegram_id: 456, phone: '+7456', created_at: new Date() }
          ] 
        });

      const req = mockReq({ id: 'shop-id' });
      const res = mockRes();

      await coffeeShopsController.getStaff(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ telegram_id: 123 }),
          expect.objectContaining({ telegram_id: 456 })
        ])
      );
    });
  });

  describe('addStaff', () => {
    test('должен вернуть 400 без telegramId', async () => {
      const req = mockReq({ id: 'shop-id' }, {});
      const res = mockRes();

      await coffeeShopsController.addStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'telegramId is required' });
    });

    test('должен вернуть 404 если пользователь не найден', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const req = mockReq({ id: 'shop-id' }, { telegramId: 123 });
      const res = mockRes();

      await coffeeShopsController.addStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    test('должен вернуть 404 если кофейня не найдена', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ telegram_id: 123 }] })
        .mockResolvedValueOnce({ rows: [] });

      const req = mockReq({ id: 'shop-id' }, { telegramId: 123 });
      const res = mockRes();

      await coffeeShopsController.addStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Coffee shop not found' });
    });

    test('должен добавить сотрудника', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ telegram_id: 123 }] })
        .mockResolvedValueOnce({ rows: [{ staff: [123] }] });

      const req = mockReq({ id: 'shop-id' }, { telegramId: 123 });
      const res = mockRes();

      await coffeeShopsController.addStaff(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, staff: [123] });
    });
  });

  describe('removeStaff', () => {
    test('должен вернуть 404 если кофейня не найдена', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const req = mockReq({ id: 'shop-id', telegramId: 123 });
      const res = mockRes();

      await coffeeShopsController.removeStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Coffee shop not found' });
    });

    test('должен удалить сотрудника', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ staff: [] }] });

      const req = mockReq({ id: 'shop-id', telegramId: 123 });
      const res = mockRes();

      await coffeeShopsController.removeStaff(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, staff: [] });
    });
  });

  describe('CoffeeShops Error Handling', () => {
    test('getCoffeeShop должен обработать ошибку сервера', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({ id: 'shop-id' });
      const res = mockRes();

      await coffeeShopsController.getCoffeeShop(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    test('updateCoffeeShop должен обработать ошибку сервера', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({ id: 'shop-id' }, { name: 'Updated' });
      const res = mockRes();

      await coffeeShopsController.updateCoffeeShop(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    test('getStaff должен обработать ошибку сервера', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({ id: 'shop-id' });
      const res = mockRes();

      await coffeeShopsController.getStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    test('addStaff должен обработать ошибку сервера', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({ id: 'shop-id' }, { telegramId: 123 });
      const res = mockRes();

      await coffeeShopsController.addStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    test('removeStaff должен обработать ошибку сервера', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({ id: 'shop-id', telegramId: 123 });
      const res = mockRes();

      await coffeeShopsController.removeStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});

describe('Stats Controller', () => {
  const mockReq = (query = {}) => ({ query });

  describe('getDailyStats', () => {
    test('должен вернуть 400 без coffee_shop_id', async () => {
      const req = mockReq();
      const res = mockRes();

      await statsController.getDailyStats(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'coffee_shop_id is required' });
    });

    test('должен вернуть статистику за день', async () => {
      pool.query.mockResolvedValueOnce({ 
        rows: [{ total_orders: '10', total_revenue: '5000' }] 
      });

      const req = mockReq({ coffee_shop_id: 'shop-1' });
      const res = mockRes();

      await statsController.getDailyStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        totalOrders: 10,
        totalRevenue: 5000
      });
    });

    test('должен вернуть 0 если нет заказов', async () => {
      pool.query.mockResolvedValueOnce({ 
        rows: [{ total_orders: null, total_revenue: null }] 
      });

      const req = mockReq({ coffee_shop_id: 'shop-1' });
      const res = mockRes();

      await statsController.getDailyStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        totalOrders: 0,
        totalRevenue: 0
      });
    });

    test('должен обработать ошибку сервера', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({ coffee_shop_id: 'shop-1' });
      const res = mockRes();

      await statsController.getDailyStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});

