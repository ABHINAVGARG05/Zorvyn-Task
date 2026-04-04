import { Router } from "express";
import { summary, byCategory, trends, recent } from "./dashboard.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validateQuery } from "../../middlewares/validateSchema";
import { dashboardFilterSchema } from "../../schemas/dashboard";

const router: Router = Router();

router.use(authenticate);
router.use(authorize("admin", "analyst", "viewer"));

router.get("/summary", validateQuery(dashboardFilterSchema), summary);
router.get("/by-category", validateQuery(dashboardFilterSchema), byCategory);
router.get("/trends", validateQuery(dashboardFilterSchema), trends);
router.get("/recent", validateQuery(dashboardFilterSchema), recent);

export default router;
