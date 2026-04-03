import { Router } from "express";
import { summary, byCategory, trends, recent } from "./dashboard.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router : Router = Router();

router.use(authenticate);
router.use(authorize("admin", "analyst", "viewer"));

router.get("/summary", summary);
router.get("/by-category", byCategory);
router.get("/trends", trends);
router.get("/recent", recent);

export default router;
