import { z } from "zod";

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");

const numberFromQuery = z.preprocess((value) => {
  if (typeof value === "string") return Number(value);
  return value;
}, z.number().int());

export const dashboardFilterSchema = z.object({
  from: dateString.optional(),
  to: dateString.optional(),
  period: z.enum(["month", "week"]).optional(),
  limit: numberFromQuery
    .optional()
    .refine((v) => (v ?? 10) > 0 && (v ?? 10) < 101, {
      message: "limit must be between 1 and 100",
    }),
});
