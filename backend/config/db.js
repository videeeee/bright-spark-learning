const mongoose = require("mongoose");
const dns = require("dns");
const env = require("./env");

// Optional local DNS resolver override (off by default; activate locally only if ENABLE_CUSTOM_DNS=true)
if (process.env.ENABLE_CUSTOM_DNS === "true") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // Ignore fallback error
  }
}

// Utility to mask credentials in connection URI for safe logging
function maskMongoUri(uri) {
  try {
    return uri.replace(/\/\/(.*?):(.*?)@/, "//$1:******@");
  } catch {
    return "mongodb://******";
  }
}

const connectDB = async (maxRetries = 5, retryDelayMs = 3000) => {
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      console.log(`📡 Connecting to MongoDB (attempt ${attempt}/${maxRetries}): ${maskMongoUri(env.MONGO_URI)}`);
      
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log(`✅ MongoDB connected successfully to database: [${mongoose.connection.name}]`);
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, err.message);

      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelayMs / 1000}s...`);
        await new Promise((res) => setTimeout(res, retryDelayMs));
        attempt++;
      } else {
        console.error("🚨 Critical: Unable to connect to MongoDB after maximum retries.");
        // In production container environments, do not hard crash; let healthcheck reflect failure
        if (env.NODE_ENV === "test") {
          throw err;
        }
        break;
      }
    }
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected. Attempting to reconnect automatically...");
});

mongoose.connection.on("error", (err) => {
  console.error("⚠️ MongoDB connection error:", err.message);
});

module.exports = connectDB;
