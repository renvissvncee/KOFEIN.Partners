import crypto from 'crypto';

export const parseInitData = (data) => {
  const params = new URLSearchParams(data);
  const result = {};
  for (const [key, value] of params) {
    try {
      result[key] = JSON.parse(value);
    } catch {
      result[key] = value;
    }
  }
  return result;
};

export const verifyTelegramHash = (parsedData, botToken) => {
  const hash = parsedData.hash;
  delete parsedData.hash;
  
  const dataCheckString = Object.keys(parsedData)
    .sort()
    .map(key => `${key}=${parsedData[key]}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return hash === calculatedHash;
};
