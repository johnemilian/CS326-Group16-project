// routers/tasks.js

import { Router } from "express";
import * as tasksController from "../controllers/tasksController.js";
import { requireLogin } from "../middleware/requireLogin.js";
import { asyncHandler } from "../asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(tasksController.viewView));
router.get("/manage", asyncHandler(tasksController.manageView));
router.post("/", requireLogin, asyncHandler(tasksController.create));
router.put("/:id", requireLogin, asyncHandler(tasksController.update));
router.delete("/:id", requireLogin, asyncHandler(tasksController.destroy));
router.patch("/:id/priority", requireLogin, asyncHandler(tasksController.togglePriority));
router.patch("/:id/completed", requireLogin, asyncHandler(tasksController.toggleCompleted));

export default router;
