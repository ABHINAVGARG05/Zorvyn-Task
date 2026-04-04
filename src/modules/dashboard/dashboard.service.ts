import pool from "../../config/db";

interface DashboardFilters {
  from?: string;
  to?: string;
}

const buildDateFilter = (filters: DashboardFilters) => {
  const conditions: string[] = ["deleted_at IS NULL"];
  const params: unknown[] = [];
  let i = 1;

  if (filters.from) {
    conditions.push(`date >= $${i++}`);
    params.push(filters.from);
  }
  if (filters.to) {
    conditions.push(`date <= $${i++}`);
    params.push(filters.to);
  }

  return { where: conditions.join(" AND "), params };
};

export const getSummary = async (filters: DashboardFilters = {}) => {
  const { where, params } = buildDateFilter(filters);
  const result = await pool.query(
    `
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS net_balance
    FROM records
    WHERE ${where}
  `,
    params,
  );
  return result.rows[0];
};

export const getByCategory = async (filters: DashboardFilters = {}) => {
  const { where, params } = buildDateFilter(filters);
  const result = await pool.query(
    `
    SELECT
      category,
      type,
      COALESCE(SUM(amount), 0) AS total,
      COUNT(*) AS count
    FROM records
    WHERE ${where}
    GROUP BY category, type
    ORDER BY total DESC
  `,
    params,
  );
  return result.rows;
};

export const getTrends = async (
  filters: DashboardFilters & { period?: string } = {},
) => {
  const { where, params } = buildDateFilter(filters);
  const period = filters.period === "week" ? "week" : "month";
  const labelFormat = period === "week" ? "IYYY-IW" : "YYYY-MM";

  const result = await pool.query(
    `
    SELECT
      TO_CHAR(DATE_TRUNC('${period}', date), '${labelFormat}') AS period,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS net_balance
    FROM records
    WHERE ${where}
    GROUP BY DATE_TRUNC('${period}', date)
    ORDER BY DATE_TRUNC('${period}', date) DESC
  `,
    params,
  );
  return result.rows;
};

export const getRecent = async (
  filters: DashboardFilters & { limit?: number } = {},
) => {
  const { where, params } = buildDateFilter(filters);
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
  params.push(limit);

  const result = await pool.query(
    `
    SELECT *
    FROM records
    WHERE ${where}
    ORDER BY created_at DESC
    LIMIT $${params.length}
  `,
    params,
  );
  return result.rows;
};
