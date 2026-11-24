import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { asyncHandler } from "../asyncHandler.js";

const router = Router();

router.get("/login", authController.showLogin);
router.post("/login", asyncHandler(authController.login));
router.get("/signup", authController.showSignup);
router.post("/signup", asyncHandler(authController.signup));
// POST, not GET, so a link or image on another site cannot log someone out.
router.post("/logout", asyncHandler(authController.logout));

export default router;
