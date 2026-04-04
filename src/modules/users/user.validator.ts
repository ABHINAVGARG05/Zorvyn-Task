import { body, query } from "express-validator";

export const updateRoleValidator = [
  body("role")
    .isIn(["admin", "analyst", "viewer"])
    .withMessage("Role must be admin, analyst or viewer"),
];

export const updateStatusValidator = [
  body("status")
    .isIn(["active", "inactive"])
    .withMessage("Status must be active or inactive"),
];

export const userListValidator = [
  query("page")
    .optional()
    .isInt({ gt: 0, lt: 1000 })
    .withMessage("page must be a positive integer less than 1000"),
  query("limit")
    .optional()
    .isInt({ gt: 0, lt: 101 })
    .withMessage("limit must be between 1 and 100"),
];
