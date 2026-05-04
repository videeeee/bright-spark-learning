const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "No token" });
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "SECRET_KEY"
    );

    req.user = decoded;
    req.userId = decoded.id;

    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ msg: "Invalid token" });
  }
};