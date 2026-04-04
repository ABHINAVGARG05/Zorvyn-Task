import pool from "../../config/db";

export const getAllUsers = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const countResult = await pool.query("SELECT COUNT(*) FROM users");
  const total = parseInt(countResult.rows[0].count);

  const result = await pool.query(
    `SELECT id, name, email, role, status, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  return {
    users: result.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
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
