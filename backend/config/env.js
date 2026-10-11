const { z } = require("zod");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config(); // Also fallback to CWD if present

const envSchema = z.object({
  PORT: z.string().default("5000").transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
  CLIENT_URL: z.string().default("http://localhost:5173,http://localhost:8080,http://localhost:8081,https://learnquest-mu.vercel.app"),

  // Optional AI Provider Keys
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
});

let env;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Environment variable validation failed:");
    const issues = error.errors || error.issues || [];
    issues.forEach((err) => {
      console.error(`   - ${err.path?.join(".") || "unknown"}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

module.exports = env;
