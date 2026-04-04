import { query } from "express-validator";

export const dashboardFilterValidator = [
  query("from")
    .optional()
    .isDate()
    .withMessage("from must be a valid date (YYYY-MM-DD format)"),
  query("to")
    .optional()
    .isDate()
    .withMessage("to must be a valid date (YYYY-MM-DD format)"),
  query("period")
    .optional()
    .isIn(["month", "week"])
    .withMessage("period must be month or week"),
  query("limit")
    .optional()
    .isInt({ gt: 0, lt: 101 })
    .withMessage("limit must be between 1 and 100"),
];
