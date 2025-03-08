import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	followUnfollowUser,
	getSuggestedUsers,
	getUserProfile,
	updateUser
} from "../controllers/user.controller.js";

import {
    addEmergencyContact,
    removeEmergencyContact,
    sendEmergencyAlert
} from "../controllers/emergencyContact.controller.js"

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);

// Emergency Contact Routes
router.post("/emergency/add", protectRoute, addEmergencyContact);
router.post("/emergency/remove", protectRoute, removeEmergencyContact);
router.post("/emergency/alert", protectRoute, sendEmergencyAlert);

export default router;