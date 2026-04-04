import { z } from "zod";

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");

export const createRecordSchema = z.object({
  amount: z
    .number()
    .positive()
    .refine((value) => {
      const decimalPlaces = (value.toString().split(".")[1] || "").length;
      return decimalPlaces <= 2;
    }, "Amount can have at most 2 decimal places"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(2).max(100),
  date: dateString,
  notes: z.string().max(500).optional(),
});

export const updateRecordSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(["income", "expense"]).optional(),
  category: z.string().min(2).max(100).optional(),
  date: dateString.optional(),
  notes: z.string().max(500).optional(),
});

const numberFromQuery = z.preprocess((value) => {
  if (typeof value === "string") return Number(value);
  return value;
}, z.number().int());

export const recordFilterSchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  category: z.string().min(1).max(100).optional(),
  notes: z.string().min(1).max(500).optional(),
  from: dateString.optional(),
  to: dateString.optional(),
  page: numberFromQuery
    .optional()
    .refine((v) => (v ?? 1) > 0 && (v ?? 1) < 1000, {
      message: "page must be between 1 and 999",
    }),
  limit: numberFromQuery
    .optional()
    .refine((v) => (v ?? 10) > 0 && (v ?? 10) < 101, {
      message: "limit must be between 1 and 100",
    }),
});
