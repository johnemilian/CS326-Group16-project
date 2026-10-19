import { Router } from "express";
import * as tasksController from "../controllers/tasksController.js";
import { asyncHandler } from "../asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(tasksController.index));
router.post("/", asyncHandler(tasksController.create));
router.put("/:id", asyncHandler(tasksController.update));
router.delete("/:id", asyncHandler(tasksController.destroy));
router.patch("/:id/priority", asyncHandler(tasksController.togglePriority));

export default router;
