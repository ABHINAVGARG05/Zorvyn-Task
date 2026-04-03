import { Router } from "express";
import { getUsers, updateRole, updateStatus } from "./user.controller";
import { updateRoleValidator, updateStatusValidator } from "./user.validator";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";

const router: Router = Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/", getUsers);
router.patch("/:id/role", updateRoleValidator, validate, updateRole);
router.patch("/:id/status", updateStatusValidator, validate, updateStatus);

export default router;
