import { body } from "express-validator";

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
