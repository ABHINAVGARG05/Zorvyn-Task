import pool from "../../config/db";

interface RecordFilters {
  type?: string;
  category?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const createRecord = async (
  userId: string,
  body: {
    amount: number;
    type: string;
    category: string;
    date: string;
    notes?: string;
  },
) => {
  const { amount, type, category, date, notes } = body;
  const result = await pool.query(
    `INSERT INTO records (user_id, amount, type, category, date, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, amount, type, category, date, notes ?? null],
  );
  return result.rows[0];
};

export const getRecords = async (filters: RecordFilters) => {
  const { type, category, from, to, page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;

  const conditions: string[] = ["deleted_at IS NULL"];
  const params: unknown[] = [];
  let i = 1;

  if (type) {
    conditions.push(`type = $${i++}`);
    params.push(type);
  }
  if (category) {
    conditions.push(`category ILIKE $${i++}`);
    params.push(`%${category}%`);
  }
  if (from) {
    conditions.push(`date >= $${i++}`);
    params.push(from);
  }
  if (to) {
    conditions.push(`date <= $${i++}`);
    params.push(to);
  }

  const where = conditions.join(" AND ");

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM records WHERE ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count);

  params.push(limit, offset);
  const result = await pool.query(
    `SELECT * FROM records WHERE ${where} ORDER BY date DESC LIMIT $${i++} OFFSET $${i++}`,
    params,
  );

  return {
    records: result.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateRecord = async (
  id: string,
  body: {
    amount?: number;
    type?: string;
    category?: string;
    date?: string;
    notes?: string;
  },
) => {
  const fields: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (body.amount !== undefined) {
    fields.push(`amount = $${i++}`);
    params.push(body.amount);
  }
  if (body.type !== undefined) {
    fields.push(`type = $${i++}`);
    params.push(body.type);
  }
  if (body.category !== undefined) {
    fields.push(`category = $${i++}`);
    params.push(body.category);
  }
  if (body.date !== undefined) {
    fields.push(`date = $${i++}`);
    params.push(body.date);
  }
  if (body.notes !== undefined) {
    fields.push(`notes = $${i++}`);
    params.push(body.notes);
  }

  if (fields.length === 0) throw new Error("NO_FIELDS");

  fields.push(`updated_at = NOW()`);
  params.push(id);

  const result = await pool.query(
    `UPDATE records SET ${fields.join(", ")} WHERE id = $${i} AND deleted_at IS NULL RETURNING *`,
    params,
  );

  if (result.rows.length === 0) throw new Error("RECORD_NOT_FOUND");
  return result.rows[0];
};

export const deleteRecord = async (id: string) => {
  const result = await pool.query(
    `UPDATE records SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id],
  );
  if (result.rows.length === 0) throw new Error("RECORD_NOT_FOUND");
};
