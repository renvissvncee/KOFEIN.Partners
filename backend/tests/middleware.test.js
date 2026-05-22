import { describe, test, expect, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

import { authMiddleware } from '../middleware/auth.js';

describe('Auth Middleware', () => {
  const mockReq = (headers = {}) => ({ headers, user: null });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const mockNext = jest.fn();

  beforeEach(() => {
    mockNext.mockClear();
    jwt.verify.mockClear();
  });

  test('должен вернуть 401 без Authorization header', () => {
    const req = mockReq({});
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('должен вернуть 401 если токен начинается с Bearer но пустой', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = mockReq({ authorization: 'Bearer ' });
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('должен вернуть 401 если токен не начинается с Bearer', () => {
    const req = mockReq({ authorization: 'InvalidToken' });
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('должен вернуть 401 если токен невалидный', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = mockReq({ authorization: 'Bearer invalid-token' });
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('должен установить user и вызвать next если токен валидный', () => {
    jwt.verify.mockReturnValue({ userId: 'user-123' });

    const req = mockReq({ authorization: 'Bearer valid-token' });
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(req.user).toEqual({ userId: 'user-123' });
    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('должен обработать ошибку токена', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Token expired');
    });

    const req = mockReq({ authorization: 'Bearer expired-token' });
    const res = mockRes();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });
});
