import { Router } from "express";
import { create, list, update, remove } from "./record.controller";
import {
  createRecordValidator,
  updateRecordValidator,
  filterRecordValidator,
} from "./record.validator";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";

const router : Router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("admin", "analyst"),
  createRecordValidator,
  validate,
  create,
);
router.get(
  "/",
  authorize("admin", "analyst", "viewer"),
  filterRecordValidator,
  validate,
  list,
);
router.patch(
  "/:id",
  authorize("admin", "analyst"),
  updateRecordValidator,
  validate,
  update,
);
router.delete("/:id", authorize("admin"), remove);

export default router;
