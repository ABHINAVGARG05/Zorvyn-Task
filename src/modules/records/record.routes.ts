import { Router } from "express";
import { create, list, update, remove } from "./record.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validateSchema";
import { createRecordSchema, updateRecordSchema, recordFilterSchema } from "../../schemas/records";
import { idParamSchema } from "../../schemas/common";

const router : Router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("admin", "analyst"),
  validateBody(createRecordSchema),
  create,
);
router.get(
  "/",
  authorize("admin", "analyst", "viewer"),
  validateQuery(recordFilterSchema),
  list,
);
router.patch(
  "/:id",
  authorize("admin", "analyst"),
  validateParams(idParamSchema),
  validateBody(updateRecordSchema),
  update,
);
router.delete("/:id", authorize("admin"), validateParams(idParamSchema), remove);

export default router;
