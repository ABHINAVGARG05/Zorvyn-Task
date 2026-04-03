import pool from "../../config/db";

export const getAllUsers = async () => {
  const result = await pool.query(
    "SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC",
  );
  return result.rows;
};

export const updateUserRole = async (id: string, role: string) => {
  const result = await pool.query(
    "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role, status",
    [role, id],
  );
  if (result.rows.length === 0) throw new Error("USER_NOT_FOUND");
  return result.rows[0];
};

export const updateUserStatus = async (id: string, status: string) => {
  const result = await pool.query(
    "UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role, status",
    [status, id],
  );
  if (result.rows.length === 0) throw new Error("USER_NOT_FOUND");
  return result.rows[0];
};
