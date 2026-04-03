import pool from "../../config/db";

export const getSummary = async () => {
  const result = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS net_balance
    FROM records
    WHERE deleted_at IS NULL
  `);
  return result.rows[0];
};

export const getByCategory = async () => {
  const result = await pool.query(`
    SELECT
      category,
      type,
      COALESCE(SUM(amount), 0) AS total,
      COUNT(*) AS count
    FROM records
    WHERE deleted_at IS NULL
    GROUP BY category, type
    ORDER BY total DESC
  `);
  return result.rows;
};

export const getTrends = async () => {
  const result = await pool.query(`
    SELECT
      TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS net_balance
    FROM records
    WHERE deleted_at IS NULL
    GROUP BY DATE_TRUNC('month', date)
    ORDER BY DATE_TRUNC('month', date) DESC
  `);
  return result.rows;
};

export const getRecent = async () => {
  const result = await pool.query(`
    SELECT *
    FROM records
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 10
  `);
  return result.rows;
};
