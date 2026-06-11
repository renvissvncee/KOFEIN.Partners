import request from 'supertest';
import app from '../app.js';
import crypto from 'crypto';

export const testRequest = request(app);

export const generateTelegramInitData = (userId, botToken) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const user = { id: userId, first_name: 'Test', username: 'testuser' };
  
  const dataCheckString = `auth_date=${timestamp}\nchat=${JSON.stringify({ id: 1, type: 'private' })}\nuser=${JSON.stringify(user)}`;
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  return `auth_date=${timestamp}&chat=${encodeURIComponent(JSON.stringify({ id: 1, type: 'private' }))}&user=${encodeURIComponent(JSON.stringify(user))}&hash=${hash}`;
};
