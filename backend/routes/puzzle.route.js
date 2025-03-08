import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	createPuzzle,
	completePuzzle,
	getPatientPuzzles,
} from "../controllers/puzzle.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createPuzzle);
router.post("/complete", protectRoute, completePuzzle);
router.get("/patient", protectRoute, getPatientPuzzles);

export default router;