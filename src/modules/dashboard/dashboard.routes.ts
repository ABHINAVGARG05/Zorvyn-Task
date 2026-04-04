import { Router } from "express";
import { summary, byCategory, trends, recent } from "./dashboard.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { dashboardFilterValidator } from "./dashboard.validator";
import { validate } from "../../middlewares/validate";

const router : Router = Router();

router.use(authenticate);
router.use(authorize("admin", "analyst", "viewer"));

router.get("/summary", dashboardFilterValidator, validate, summary);
router.get("/by-category", dashboardFilterValidator, validate, byCategory);
router.get("/trends", dashboardFilterValidator, validate, trends);
router.get("/recent", dashboardFilterValidator, validate, recent);

export default router;
