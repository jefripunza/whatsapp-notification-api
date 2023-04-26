const jwt = require("jsonwebtoken");

const { JWT_SECRET_TOKEN } = require("../config");

/**
 * Create Token
 * @param {object} object data in JWT
 * @returns
 */
exports.createToken = (object, useExpired = false) => {
  const options = {};
  if (useExpired) {
    options.expiresIn = "7d";
  }
  return jwt.sign(object, JWT_SECRET_TOKEN, options);
};

/**
 * Verify Token
 * @param {string} token Bearer
 * @returns
 */
exports.validate = (token) => {
  token = String(token).split(" ")[1];
  return jwt.verify(token, JWT_SECRET_TOKEN, (err, decoded) => {
    if (err) {
      throw new Error("Not Authorized!");
    }
    return decoded;
  });
};
