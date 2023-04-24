const express = require("express");
const jwt = require("jsonwebtoken");

const { JWT_SECRET_TOKEN } = require("../config");

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns
 */
module.exports = (req, res, next) => {
  let token = req.headers.authorization;
  if (String(token).startsWith("Bearer ")) {
    token = String(token).split(" ")[1];
    return jwt.verify(token, JWT_SECRET_TOKEN, async (err, token_decoded) => {
      if (err) {
        return res.status(401).json({
          message: "Not Authorized!",
        });
      }
      req.user = token_decoded;
      return next();
    });
  } else {
    return res.status(403).json({
      message: "Authorization Bearer is required!",
    });
  }
};
