const { v4: uuidv4 } = require('uuid');

function generateEncryptKey(len = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < len; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

function generateShareToken() {
  return uuidv4();
}

module.exports = { generateEncryptKey, generateShareToken };
