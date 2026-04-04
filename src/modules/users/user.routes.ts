import { Router } from "express";
import { getUsers, updateRole, updateStatus } from "./user.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validateSchema";
import { userListSchema, updateRoleSchema, updateStatusSchema } from "../../schemas/users";
import { idParamSchema } from "../../schemas/common";

const router: Router = Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/", validateQuery(userListSchema), getUsers);
router.patch("/:id/role", validateParams(idParamSchema), validateBody(updateRoleSchema), updateRole);
router.patch("/:id/status", validateParams(idParamSchema), validateBody(updateStatusSchema), updateStatus);

export default router;
