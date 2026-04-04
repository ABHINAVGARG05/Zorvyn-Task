import { Router } from "express";
import { register, login, refresh, logout } from "./auth.controller";
import { validateBody } from "../../middlewares/validateSchema";
import { registerSchema, loginSchema, refreshSchema } from "../../schemas/auth";

const router: Router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.post("/logout", validateBody(refreshSchema), logout);

export default router;
