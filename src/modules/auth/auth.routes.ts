import { Router } from "express";
import { register, login } from "./auth.controller";
import { registerValidator, loginValidator } from "./auth.validator";
import { validate } from "../../middlewares/validate";

const router: Router = Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);

export default router;
