require("dotenv").config();

const env = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  AI_API_KEY: process.env.AI_API_KEY || "",
  AI_MODEL: process.env.AI_MODEL || "gemini-1.5-flash",
  JWT_SECRET: process.env.JWT_SECRET || "default_jwt_secret"
};

module.exports = env;
