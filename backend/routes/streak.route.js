import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	startStreak,
	endStreak,
	getPatientStreak,
	continueStreak
} from "../controllers/streak.controller.js";

const router = express.Router();
 
router.post("/start", protectRoute, startStreak);
router.post("/end", protectRoute, endStreak);
router.post("/continue", protectRoute, continueStreak);
router.get("/patient", protectRoute, getPatientStreak);

export default router;