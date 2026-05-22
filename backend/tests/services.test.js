import { describe, test, expect } from '@jest/globals';
import { parseInitData, verifyTelegramHash } from '../services/telegramService.js';
import crypto from 'crypto';

describe('Telegram Service', () => {
  describe('parseInitData', () => {
    test('должен распарсить initData без chat', () => {
      const user = { id: 123, first_name: 'Test', username: 'testuser' };
      const initData = `user=${encodeURIComponent(JSON.stringify(user))}&auth_date=1234567890`;

      const result = parseInitData(initData);

      expect(result).toEqual({
        user: { id: 123, first_name: 'Test', username: 'testuser' },
        auth_date: 1234567890
      });
    });

    test('должен распарсить initData с chat', () => {
      const user = { id: 123, first_name: 'Test' };
      const chat = { id: 456, type: 'private' };
      const initData = `user=${encodeURIComponent(JSON.stringify(user))}&chat=${encodeURIComponent(JSON.stringify(chat))}&auth_date=1234567890`;

      const result = parseInitData(initData);

      expect(result).toEqual({
        user: { id: 123, first_name: 'Test' },
        chat: { id: 456, type: 'private' },
        auth_date: 1234567890
      });
    });

    test('должен вернуть объект с данными для невалидной строки', () => {
      const result = parseInitData('invalid=data');

      expect(result.invalid).toBe('data');
    });

    test('должен обработать пустую строку', () => {
      const result = parseInitData('');

      expect(result).toEqual({});
    });
  });

  describe('verifyTelegramHash', () => {
    const botToken = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';

    test('должен вернуть true для валидного хэша', () => {
      const user = { id: 123, first_name: 'Test' };
      const authDate = Math.floor(Date.now() / 1000);
      
      // Порядок ключей должен быть отсортирован по алфавиту
      const dataCheckString = `auth_date=${authDate}\nuser=${JSON.stringify(user)}`;
      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
      const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
      
      // Важно: объект должен быть передан с ключами в порядке сортировки
      const parsedData = { 
        auth_date: authDate, 
        user, 
        hash 
      };

      const result = verifyTelegramHash(parsedData, botToken);

      expect(result).toBe(true);
    });

    test('должен вернуть false для неверного хэша', () => {
      const user = { id: 123, first_name: 'Test' };
      const parsedData = { 
        auth_date: 1234567890, 
        user, 
        hash: 'invalidhash' 
      };

      const result = verifyTelegramHash(parsedData, botToken);

      expect(result).toBe(false);
    });

    test('должен вернуть false если hash отсутствует', () => {
      const user = { id: 123, first_name: 'Test' };
      const parsedData = { 
        auth_date: 1234567890, 
        user 
      };

      const result = verifyTelegramHash(parsedData, botToken);

      expect(result).toBe(false);
    });

    test('должен проверить хэш с chat', () => {
      const user = { id: 123, first_name: 'Test' };
      const chat = { id: 456, type: 'private' };
      const authDate = Math.floor(Date.now() / 1000);
      
      // Сортировка по алфавиту: auth_date, chat, user
      const dataCheckString = `auth_date=${authDate}\nchat=${JSON.stringify(chat)}\nuser=${JSON.stringify(user)}`;
      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
      const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
      
      const parsedData = { 
        auth_date: authDate, 
        chat, 
        user, 
        hash 
      };

      const result = verifyTelegramHash(parsedData, botToken);

      expect(result).toBe(true);
    });
  });
});
