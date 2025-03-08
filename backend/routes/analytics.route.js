import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	getUserAnalytics,
	updatePuzzleCompletion,
	updateStreakAnalytics,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUserAnalytics);
router.post("/puzzle", protectRoute, updatePuzzleCompletion);
router.post("/streak", protectRoute, updateStreakAnalytics);

export default router;