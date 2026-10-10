const env = require("../config/env");

const errorHandler = (err, req, res, next) => {
  console.error("💥 Unhandled Error:", {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Body parser bad JSON
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      msg: "Malformed JSON payload in request body",
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      msg: "Validation error",
      errors: messages,
    });
  }

  // Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      msg: `An entry with this ${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      msg: "Invalid authorization token",
    });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      msg: "Authorization token expired",
    });
  }

  // Fallback 500
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    msg: err.isOperational ? err.message : "Internal server error",
    ...(env.NODE_ENV === "development" && { details: err.message, stack: err.stack }),
  });
};

module.exports = errorHandler;
