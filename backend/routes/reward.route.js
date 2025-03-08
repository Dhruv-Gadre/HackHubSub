import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { awardStreakReward, getUserRewards } from "../controllers/reward.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUserRewards);
router.post("/award", protectRoute, awardStreakReward);

export default router;