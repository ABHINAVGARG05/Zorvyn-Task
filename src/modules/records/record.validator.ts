import { body, query } from "express-validator";

export const createRecordValidator = [
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number greater than 0")
    .custom((value) => {
      const decimalPlaces = (value.toString().split(".")[1] || "").length;
      if (decimalPlaces > 2) {
        throw new Error("Amount can have at most 2 decimal places");
      }
      return true;
    }),
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be either 'income' or 'expense'"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category must be between 2 and 100 characters"),
  body("date")
    .isDate()
    .withMessage("Date must be a valid date (YYYY-MM-DD format)"),
  body("notes")
    .optional()
    .trim()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
];

export const updateRecordValidator = [
  body("amount")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number greater than 0")
    .custom((value) => {
      const decimalPlaces = (value.toString().split(".")[1] || "").length;
      if (decimalPlaces > 2) {
        throw new Error("Amount can have at most 2 decimal places");
      }
      return true;
    }),
  body("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Type must be either 'income' or 'expense'"),
  body("category")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category must be between 2 and 100 characters"),
  body("date")
    .optional()
    .isDate()
    .withMessage("Date must be a valid date (YYYY-MM-DD format)"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
];

export const filterRecordValidator = [
  query("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Type must be either 'income' or 'expense'"),
  query("category")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Category must be between 1 and 100 characters"),
  query("from")
    .optional()
    .isDate()
    .withMessage("from must be a valid date (YYYY-MM-DD format)"),
  query("to")
    .optional()
    .isDate()
    .withMessage("to must be a valid date (YYYY-MM-DD format)"),
  query("page")
    .optional()
    .isInt({ gt: 0, lt: 1000 })
    .withMessage("page must be a positive integer less than 1000"),
  query("limit")
    .optional()
    .isInt({ gt: 0, lt: 100 })
    .withMessage("limit must be a positive integer less than 100"),
];
