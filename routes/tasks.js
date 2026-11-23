// routers/tasks.js

import { Router } from "express";
import * as tasksController from "../controllers/tasksController.js";
import { asyncHandler } from "../asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(tasksController.viewView));
router.get("/manage", asyncHandler(tasksController.manageView));
router.post("/", asyncHandler(tasksController.create));
router.put("/:id", asyncHandler(tasksController.update));
router.delete("/:id", asyncHandler(tasksController.destroy));
router.patch("/:id/priority", asyncHandler(tasksController.togglePriority));
router.patch("/:id/completed", asyncHandler(tasksController.toggleCompleted));

export default router;
