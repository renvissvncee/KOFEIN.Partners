import request from 'supertest';
import app from '../app.js';

export const testRequest = request(app);

export const generateTelegramInitData = (userId, botToken) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const user = { id: userId, first_name: 'Test', username: 'testuser' };
  
  const dataCheckString = `chat=${JSON.stringify({ id: 1, type: 'private' })}\nuser=${JSON.stringify(user)}\nauth_date=${timestamp}`;
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  return `chat=${encodeURIComponent(JSON.stringify({ id: 1, type: 'private' }))}&user=${encodeURIComponent(JSON.stringify(user))}&auth_date=${timestamp}&hash=${hash}`;
};
