import express from "express";
import { getMe, login, logout } from "../controllers/auth.controller.js";

import { doctorSignup, doctorLogin, getDoctorPatients } from "../controllers/doctors.controller.js";
import { patientSignup, patientLogin } from "../controllers/patients.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.post("/docSignup", doctorSignup);
router.post("/patientSignup", patientSignup);
router.post("/docLogin", doctorLogin);
router.post("/patientLogin", patientLogin);
router.get("/doctor/:doctorId", getDoctorPatients);
router.post("/login", login);
router.post("/logout", logout);

export default router;
