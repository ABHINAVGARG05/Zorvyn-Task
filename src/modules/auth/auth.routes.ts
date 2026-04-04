import { Router } from "express";
import { register, login } from "./auth.controller";
import { validateBody } from "../../middlewares/validateSchema";
import { registerSchema, loginSchema } from "../../schemas/auth";

const router: Router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);

export default router;
