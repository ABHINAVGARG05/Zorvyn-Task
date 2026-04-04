import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT) || 3000,

  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT) || 5432,
  DB_NAME: process.env.DB_NAME || "finance_db",
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD,

  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  JWT_REFRESH_EXPIRES_IN_MS: Number(
    process.env.JWT_REFRESH_EXPIRES_IN_MS || 1000 * 60 * 60 * 24 * 30,
  ),

  CORS_ORIGIN:
    process.env.CORS_ORIGIN ||
    "http://localhost:3000,https://zorvyn-task.abhinavgarg.in",
};
