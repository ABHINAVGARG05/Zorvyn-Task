import { body, query } from "express-validator";

export const createRecordValidator = [
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),
  body("category").notEmpty().withMessage("Category is required"),
  body("date").isDate().withMessage("Date must be a valid date"),
  body("notes").optional().isString(),
];

export const updateRecordValidator = [
  body("amount")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),
  body("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),
  body("category").optional().isString(),
  body("date").optional().isDate().withMessage("Date must be a valid date"),
  body("notes").optional().isString(),
];

export const filterRecordValidator = [
  query("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),
  query("category").optional().isString(),
  query("from").optional().isDate().withMessage("from must be a valid date"),
  query("to").optional().isDate().withMessage("to must be a valid date"),
  query("page")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("limit must be a positive integer"),
];
