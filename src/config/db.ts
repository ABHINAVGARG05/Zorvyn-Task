import { Pool } from "pg";
import { env } from "../constants/constant";

const pool = new Pool({
  host: env.DB_HOST,
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
