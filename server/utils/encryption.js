const CryptoJS = require('crypto-js');

/**
 * Dynamically resolve the AES secret key.
 * Evaluates at runtime to ensure compatibility regardless of module import order.
 */
const getSecretKey = () => {
  if (process.env.AES_SECRET_KEY) {
    return process.env.AES_SECRET_KEY;
  }
  try {
    require('dotenv').config();
  } catch (_) {}
  return process.env.AES_SECRET_KEY || 'university-hub-aes-encryption-key-2024-secure';
};

// Encrypt a URL or string
const encrypt = (text) => {
  if (!text) return null;
  const key = getSecretKey();
  return CryptoJS.AES.encrypt(text, key).toString();
};

// Decrypt a URL or string
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  const key = getSecretKey();
  const bytes = CryptoJS.AES.decrypt(encryptedText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt, getSecretKey };
