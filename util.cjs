const randChar = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return chars.charAt(Math.floor(Math.random() * chars.length));
};

const generateRandomString = () => {
  let randomString = "";
  for (let i = 0; i < 10; i++) {
    randomString += randChar();
  }
  return randomString;
};

module.exports = generateRandomString;

// This script generates a random 10-character string consisting of
// uppercase letters, lowercase letters, and digits.
// It is intended to be used for generating random names or identifiers in applications.

// Note: This file is not meant to be edited .
