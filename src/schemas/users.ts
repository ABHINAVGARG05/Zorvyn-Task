import { z } from "zod";

const numberFromQuery = z.preprocess((value) => {
  if (typeof value === "string") return Number(value);
  return value;
}, z.number().int());

export const userListSchema = z.object({
  page: numberFromQuery.optional().refine((v) => (v ?? 1) > 0 && (v ?? 1) < 1000, {
    message: "page must be between 1 and 999",
  }),
  limit: numberFromQuery.optional().refine((v) => (v ?? 10) > 0 && (v ?? 10) < 101, {
    message: "limit must be between 1 and 100",
  }),
});

export const updateRoleSchema = z.object({
  role: z.enum(["admin", "analyst", "viewer"]),
});

export const updateStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});
