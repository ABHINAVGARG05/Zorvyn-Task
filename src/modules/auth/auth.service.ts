import pool from "../../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../../constants/constant";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const signRefreshToken = (userId: string, role: string, jti: string) => {
  if (!env.JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET_MISSING");
  return jwt.sign(
    { id: userId, role, jti },
    env.JWT_REFRESH_SECRET as jwt.Secret,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"] },
  );
};

const persistRefreshToken = async (
  userId: string,
  jti: string,
  refreshToken: string,
) => {
  const expiresAt = new Date(
    Date.now() + env.JWT_REFRESH_EXPIRES_IN_MS,
  ).toISOString();
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_jti, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, jti, hashToken(refreshToken), expiresAt],
  );
};

const isRefreshPayload = (
  value: unknown,
): value is { id: string; role: string; jti: string } => {
  if (!value || typeof value !== "object") return false;
  const payload = value as { id?: unknown; role?: unknown; jti?: unknown };
  return (
    typeof payload.id === "string" &&
    typeof payload.role === "string" &&
    typeof payload.jti === "string"
  );
};

const isRefreshJtiPayload = (value: unknown): value is { jti: string } => {
  if (!value || typeof value !== "object") return false;
  const payload = value as { jti?: unknown };
  return typeof payload.jti === "string";
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) throw new Error("EMAIL_TAKEN");

  const password_hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash) 
     VALUES ($1, $2, $3) 
     RETURNING id, name, email, role, status, created_at`,
    [name, email, password_hash],
  );

  return result.rows[0];
};

export const loginUser = async (email: string, password: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error("INVALID_CREDENTIALS");

  if (user.status === "inactive") throw new Error("ACCOUNT_INACTIVE");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    env.JWT_SECRET as jwt.Secret,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] },
  );

  const refreshJti = crypto.randomUUID();
  const refreshToken = signRefreshToken(user.id, user.role, refreshJti);
  await persistRefreshToken(user.id, refreshJti, refreshToken);

  return {
    token,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const refreshAuthToken = async (refreshToken: string) => {
  let decoded: { id: string; role: string; jti: string };
  try {
    const verified = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET as jwt.Secret,
    ) as unknown;
    if (!isRefreshPayload(verified)) throw new Error("REFRESH_INVALID");
    decoded = verified;
  } catch {
    throw new Error("REFRESH_INVALID");
  }

  const tokenHash = hashToken(refreshToken);
  const result = await pool.query(
    `SELECT revoked_at, expires_at
     FROM refresh_tokens
     WHERE token_jti = $1 AND token_hash = $2`,
    [decoded.jti, tokenHash],
  );

  if (result.rows.length === 0) throw new Error("REFRESH_INVALID");
  if (result.rows[0].revoked_at) throw new Error("REFRESH_REVOKED");
  if (new Date(result.rows[0].expires_at) < new Date()) {
    throw new Error("REFRESH_EXPIRED");
  }

  await pool.query(
    "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_jti = $1",
    [decoded.jti],
  );

  const accessToken = jwt.sign(
    { id: decoded.id, role: decoded.role },
    env.JWT_SECRET as jwt.Secret,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] },
  );

  const nextJti = crypto.randomUUID();
  const nextRefreshToken = signRefreshToken(decoded.id, decoded.role, nextJti);
  await persistRefreshToken(decoded.id, nextJti, nextRefreshToken);

  return {
    token: accessToken,
    refreshToken: nextRefreshToken,
  };
};

export const revokeRefreshToken = async (refreshToken: string) => {
  let decoded: { jti: string };
  try {
    const verified = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET as jwt.Secret,
    ) as unknown;
    if (!isRefreshJtiPayload(verified)) throw new Error("REFRESH_INVALID");
    decoded = verified;
  } catch {
    throw new Error("REFRESH_INVALID");
  }

  await pool.query(
    "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_jti = $1",
    [decoded.jti],
  );
};
