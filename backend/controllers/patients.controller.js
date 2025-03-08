import Patient from "../models/patients.model.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import axios from "axios";
import Doctor from "../models/doctors.model.js"; // Make sure to import the Doctor model


export const patientSignup = async (req, res) => {
	try {
		const { 
			fullName,  
			email, 
			password, 
			confirmPassword,
			age, 
			latitude, 
			longitude,
			role = "Patient",
			doctor,
			formA = {},
			doctorNotes = ""
		} = req.body; 

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Check if email is already taken
		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}

		// Validate password length
		if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

		// Check if passwords match
		if (password !== confirmPassword) {
			return res.status(400).json({ error: "Passwords do not match" });
		}

		// Validate role
		if (!["Patient", "Doctor", "EmergencyContact"].includes(role)) {
			return res.status(400).json({ error: "Invalid role specified" });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Process Form A data
		const familyStructureValues = [
			formA.singleParent ? 1 : 0,
			formA.parentsDuggie ? 1 : 0,
			0, 0, 0
		];

		const socioEcoStatsValues = [
			formA.socioeconomicScale || 0,
			0, 0, 0, 0
		];

		const relationshipValues = [
			formA.abusiveFamily ? 1 : 0,
			formA.abusiveFriends ? 1 : 0,
			formA.abusivePartner ? 1 : 0,
			0, 0
		];

		const healthSupportValues = [
			formA.chronicFamilyHealth ? 1 : 0,
			formA.spiritualSupport ? 1 : 0,
			formA.selfHarm ? 1 : 0,
			0, 0
		];

		const sadPersonValues = [
			formA.sexMale ? 1 : 0,
			formA.ageRisk ? 1 : 0,
			formA.depression ? 1 : 0,
			formA.previousAttempt ? 1 : 0,
			formA.ethanol ? 1 : 0,
			formA.rationalThinking ? 1 : 0,
			formA.socialSupport ? 1 : 0,
			formA.organizedPlan ? 1 : 0,
			formA.noPartner ? 1 : 0,
			formA.sickness ? 1 : 0
		].slice(0, 5); 

		const additionalValues = [
			formA.recentPhysicianVisit ? 1 : 0,
			formA.bodyImage ? 1 : 0,
			formA.sexualAbuse ? 1 : 0,
			formA.behaviorChange ? 1 : 0,
			formA.localityDrugs ? 1 : 0
		];

		// Create new user
		const newUser = new User({
			fullName,
			email,
			password: hashedPassword,
			age,
			role,
			doctor,
			doctorDesc: doctorNotes,
			location: {
				type: "Point",
				coordinates: [parseFloat(longitude), parseFloat(latitude)]
			},
			familyStructure: { values: familyStructureValues },
			socioEcoStats: { values: socioEcoStatsValues },
			relationship: { values: relationshipValues },
			healthSupport: { values: healthSupportValues },
			sadPerson: { values: sadPersonValues },
			additional: { values: additionalValues },
			emergencyContacts: [],
			sobrietyStreak: 0,
			puzzleSchedule: ["09:00", "15:00", "21:00"],
			followers: [],
			following: [],
			lastUpdated: new Date(),
			streakHistory: []
		});

		if (newUser) {
			// Save new user to the database
			await newUser.save();

			// Add the new patient's ID to the doctor's patient list
			const doctorRecord = await Doctor.findById(doctor);
			if (doctorRecord) {
				doctorRecord.patients.push(newUser._id);
				await doctorRecord.save();
			} else {
				console.error("Doctor not found. Could not add patient to doctor's list.");
			}

			// Prepare JSON payload for FastAPI service
			const PatientData = {
				patientId: newUser._id.toString(),  // Ensuring patientId is a string
				Lat: { values: [parseFloat(latitude), parseFloat(longitude)], weights: 1 },
				role: newUser.role,
				familyStructure: { values: familyStructureValues, weights: 1 },
				socioEcoStats: { values: socioEcoStatsValues, weights: 1 },
				relationship: { values: relationshipValues, weights: 1 },
				healthSupport: { values: healthSupportValues, weights: 1 },
				sadPerson: { values: sadPersonValues, weights: 1 },
				additional: { values: additionalValues, weights: 1 },
				doctorDesc: newUser.doctorDesc
			};

			// Send patient data to FastAPI service
			try {
				const response = await axios.post(
					"http://192.168.235.152:58908/add_patient", 
					PatientData,
					{ headers: { "Content-Type": "application/json" } }
				);
				console.log("FastAPI Response:", response.data);
			} catch (error) {
				console.error("Error sending data to FastAPI:", error.message); 
			}

			// Return user data (excluding sensitive fields like the password)
			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				email: newUser.email,
				role: newUser.role,
				age: newUser.age,
				location: newUser.location,
				doctor: newUser.doctor,
				emergencyContacts: newUser.emergencyContacts,
				sobrietyStreak: newUser.sobrietyStreak,
				puzzleSchedule: newUser.puzzleSchedule,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const patientLogin = async (req, res) => {
    try {
        let { username, password } = req.body;

        // Ensure username is treated as fullName
        const fullName = username.trim(); 

        // Find the user based on fullName (use .lean() to avoid circular structure)
        const user = await User.findOne({ fullName }).lean();

        console.log("User found:", user); // Debugging step

        // Check if user exists
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Validate password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Generate JWT token and set cookie
        generateTokenAndSetCookie(user._id,"patient", res);

        // Ensure no circular structures in response
        const safeUser = JSON.parse(JSON.stringify(user));

        // Return user data (excluding sensitive fields like password)
        res.status(200).json({
            _id: safeUser._id,
            fullName: safeUser.fullName,
            email: safeUser.email,
            role: safeUser.role,
            patients: safeUser.patients || [],
            emergencyContacts: safeUser.emergencyContacts || [],
            sobrietyStreak: safeUser.sobrietyStreak || 0,
            puzzleSchedule: safeUser.puzzleSchedule || [],
            followers: safeUser.followers || [],
            following: safeUser.following || [],
            profileImg: safeUser.profileImg || "",
            coverImg: safeUser.coverImg || "",
        });

    } catch (error) {
        console.error("Error in login controller:", error); // Log the entire error
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateSobrietyStreak = async (req, res) => {
    try {
        const { patientId } = req.params;
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const today = new Date();
        const lastUpdatedDate = patient.lastUpdated ? new Date(patient.lastUpdated) : null;

        // Check if last update was more than 24 hours ago
        if (!lastUpdatedDate || (today - lastUpdatedDate) > 24 * 60 * 60 * 1000) {
            // Reset streak if more than 24 hours have passed
            patient.sobrietyStreak = 1;
            patient.streakHistory = [today]; // Reset history
        } else {
            // Continue streak
            patient.sobrietyStreak += 1;
            patient.streakHistory.push(today);
        }

        // Update lastUpdated timestamp
        patient.lastUpdated = today;
        await patient.save();

        res.status(200).json({
            message: "Sobriety streak updated successfully!",
            sobrietyStreak: patient.sobrietyStreak,
            streakHistory: patient.streakHistory
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getSobrietyStreak = async (req, res) => {
    try {
        const { patientId } = req.params;
        const patient = await Patient.findById(patientId).select("sobrietyStreak lastUpdated");

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json({
            sobrietyStreak: patient.sobrietyStreak,
            lastUpdated: patient.lastUpdated
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getStreakHistory = async (req, res) => {
    try {
        const { patientId } = req.params;
        const patient = await Patient.findById(patientId).select("sobrietyStreak streakHistory");

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json({
            sobrietyStreak: patient.sobrietyStreak,
            streakHistory: patient.streakHistory
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
