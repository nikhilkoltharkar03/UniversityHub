const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.AES_SECRET_KEY;

// Encrypt a URL or string
const encrypt = (text) => {
  if (!text) return null;
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

// Decrypt a URL or string
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt };