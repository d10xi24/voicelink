const generateRandomString = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let randomString = "VL-";

  // Generate 4 random letters
  for (let i = 0; i < 4; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Generate 4 random numbers
  for (let i = 0; i < 4; i++) {
    randomString += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return randomString;
};

module.exports = generateRandomString;

// This script generates a random 10-character string consisting of
// uppercase letters, lowercase letters, and digits.
// It is intended to be used for generating random names or identifiers in applications.

// Note: This file is not meant to be edited .
