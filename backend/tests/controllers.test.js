import { describe, test, expect, jest } from '@jest/globals';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token')
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

describe('Auth Controller', () => {
  const mockReq = (body = {}) => ({ body });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  test('login должен вернуть 400 без password', async () => {
    const req = mockReq({ devTelegramId: 123 });
    const res = mockRes();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'password is required' });
  });

  test('login должен вернуть 401 если пользователь не найден', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq({ devTelegramId: 123, password: 'test' });
    const res = mockRes();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  test('login должен вернуть 401 если пользователь не назначен в кофейню', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 'user-id', telegram_id: 123, password_hash: 'hash' }] })
      .mockResolvedValueOnce({ rows: [] });

    const req = mockReq({ devTelegramId: 123, password: 'test' });
    const res = mockRes();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User has no coffee shop assigned' });
  });

  test('me должен вернуть данные пользователя', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'user-id', telegram_id: 123, phone: '+7123' }] });

    const req = { userId: 'user-id' };
    const res = mockRes();

    await authController.me(req, res);

    expect(res.json).toHaveBeenCalledWith({ userId: 'user-id', telegramId: 123, phone: '+7123' });
  });
});

describe('Orders Controller', () => {
  const mockReq = (query = {}) => ({ query, params: {} });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  test('getOrders должен вернуть все заказы без фильтров', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq();
    const res = mockRes();

    await ordersController.getOrders(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('getOrders должен фильтровать по coffee_shop_id', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq({ coffee_shop_id: 'shop-id' });
    const res = mockRes();

    await ordersController.getOrders(req, res);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('coffee_shop_id = $1'),
      ['shop-id']
    );
  });

  test('getOrders должен фильтровать по статусу', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq({ status: 'New' });
    const res = mockRes();

    await ordersController.getOrders(req, res);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('status = $1'),
      ['New']
    );
  });

  test('updateOrderStatus должен вернуть 400 без status', async () => {
    const req = { params: { id: 'order-id' }, body: {} };
    const res = mockRes();

    await ordersController.updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing status in body' });
  });

  test('updateOrderStatus должен вернуть 404 если заказ не найден', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = { params: { id: 'order-id' }, body: { status: 'Preparing' } };
    const res = mockRes();

    await ordersController.updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Order not found' });
  });

  test('updateOrderStatus должен обновить статус', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'order-id', status: 'Preparing' }] });

    const req = { params: { id: 'order-id' }, body: { status: 'Preparing' } };
    const res = mockRes();

    await ordersController.updateOrderStatus(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 'order-id', status: 'Preparing' });
  });
});

describe('Menu Controller', () => {
  const mockReq = (body = {}, params = {}) => ({ body, params });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  test('getMenu должен вернуть 400 без coffee_shop_id', async () => {
    const req = mockReq();
    const res = mockRes();

    await menuController.getMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'coffee_shop_id is required' });
  });

  test('getMenu должен вернуть меню', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq({}, { coffee_shop_id: 'shop-id' });
    const res = mockRes();

    await menuController.getMenu(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('createMenuItem должен вернуть 400 без required fields', async () => {
    const req = mockReq({});
    const res = mockRes();

    await menuController.createMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
  });

  test('createMenuItem должен создать товар', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 'item-id', name: 'Test', price: 100, available: true }]
    });

    const req = mockReq({
      coffee_shop_id: 'shop-id',
      name: 'Test',
      price: 100,
      available: true
    });
    const res = mockRes();

    await menuController.createMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'item-id', name: 'Test' })
    );
  });

  test('updateMenuItem должен вернуть 404 если товар не найден', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq({ name: 'Updated' }, { id: 'item-id' });
    const res = mockRes();

    await menuController.updateMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Menu item not found' });
  });

  test('deleteMenuItem должен вернуть 404 если товар не найден', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq({}, { id: 'item-id' });
    const res = mockRes();

    await menuController.deleteMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Menu item not found' });
  });

  test('deleteMenuItem должен удалить товар', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'item-id' }] });

    const req = mockReq({}, { id: 'item-id' });
    const res = mockRes();

    await menuController.deleteMenuItem(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true });
  });
});

describe('Coffee Shops Controller', () => {
  const mockReq = (params = {}) => ({ params });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  test('getCoffeeShop должен вернуть 404 если кофейня не найдена', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq({ id: 'shop-id' });
    const res = mockRes();

    await coffeeShopsController.getCoffeeShop(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Coffee shop not found' });
  });

  test('getCoffeeShop должен вернуть кофейню', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 'shop-id', name: 'Test Shop', address: 'Test Address' }]
    });

    const req = mockReq({ id: 'shop-id' });
    const res = mockRes();

    await coffeeShopsController.getCoffeeShop(req, res);

    expect(res.json).toHaveBeenCalledWith({
      id: 'shop-id',
      name: 'Test Shop',
      address: 'Test Address'
    });
  });

  test('updateCoffeeShop должен вернуть 404 если кофейня не найдена', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq({ id: 'shop-id' });
    const res = mockRes();

    await coffeeShopsController.updateCoffeeShop(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Coffee shop not found' });
  });

  test('addStaff должен вернуть 400 без telegramId', async () => {
    const req = { params: { id: 'shop-id' }, body: {} };
    const res = mockRes();

    await coffeeShopsController.addStaff(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'telegramId is required' });
  });

  test('addStaff должен вернуть 404 если кофейня не найдена', async () => {
    // Сначала проверяет пользователя (найден), потом кофейню (не найдена)
    pool.query
      .mockResolvedValueOnce({ rows: [{ telegram_id: 123 }] }) // User found
      .mockResolvedValueOnce({ rows: [] }); // Coffee shop not found

    const req = { params: { id: 'shop-id' }, body: { telegramId: 123 } };
    const res = mockRes();

    await coffeeShopsController.addStaff(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Coffee shop not found' });
  });

  test('removeStaff должен вернуть 404 если кофейня не найдена', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = { params: { id: 'shop-id', telegramId: 123 } };
    const res = mockRes();

    await coffeeShopsController.removeStaff(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Coffee shop not found' });
  });

  test('getStaff должен вернуть 404 если кофейня не найдена', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = { params: { id: 'shop-id' } };
    const res = mockRes();

    await coffeeShopsController.getStaff(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Coffee shop not found' });
  });
});
