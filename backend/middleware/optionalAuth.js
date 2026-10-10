const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * Optional Auth Middleware
 * If valid Bearer token exists, sets req.user.
 * If no token or invalid token, proceeds without setting req.user without rejecting.
 */
module.exports = function optionalAuth(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
  } catch {
    // Token invalid or expired - proceed as unauthenticated guest
  }

  next();
};
