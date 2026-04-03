import { Pool } from "pg";
import { env } from "../constants/constant";

const resolvedHost =
  process.env.NODE_ENV === "test" && env.DB_HOST === "postgres"
    ? "localhost"
    : env.DB_HOST;

const pool = new Pool({
  host: resolvedHost,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err: unknown) => {
  console.error("Unexpected error on idle client", err);
  process.exit(1);
});

export default pool;
