import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


export const signup = async (req, res) => {
	try {
		const { fullName, username, email, password, role } = req.body;

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Check if username is already taken
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ error: "Username is already taken" });
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

		// Validate role
		if (!["doctor", "patient", "emergency_contact"].includes(role)) {
			return res.status(400).json({ error: "Invalid role specified" });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create new user
		const newUser = new User({
			fullName,
			username,
			email,
			password: hashedPassword,
			role,
			// Initialize role-specific fields
			patients: role === "doctor" ? [] : undefined,
			emergencyContacts: role === "patient" ? [] : undefined,
			sobrietyStreak: role === "patient" ? 0 : undefined,
			puzzleSchedule: role === "patient" ? ["09:00", "15:00", "21:00"] : undefined,
		});

		if (newUser) {
			// Generate JWT token and set cookie
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			// Return user data (excluding sensitive fields like password)
			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				role: newUser.role,
				patients: newUser.patients,
				emergencyContacts: newUser.emergencyContacts,
				sobrietyStreak: newUser.sobrietyStreak,
				puzzleSchedule: newUser.puzzleSchedule,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
		try {
			const { username, password } = req.body;
			const user = await User.findOne({ username });
			const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

			if (!user || !isPasswordCorrect) {
				return res.status(400).json({ error: "Invalid username or password" });
			}

			// Generate JWT token and set cookie
			generateTokenAndSetCookie(user._id, res);
			
			// Return user data (excluding sensitive fields like password)
			res.status(200).json({
				_id: user._id,
				fullName: user.fullName,
				username: user.username,
				email: user.email,
				role: user.role,
				patients: user.patients,
				emergencyContacts: user.emergencyContacts,
				sobrietyStreak: user.sobrietyStreak,
				puzzleSchedule: user.puzzleSchedule,
				followers: user.followers,
				following: user.following,
				profileImg: user.profileImg,
				coverImg: user.coverImg,
			});
		} catch (error) {
			console.log("Error in login controller", error.message);
			res.status(500).json({ error: "Internal Server Error" });
		}
};

export const logout = async (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getMe = async (req, res) => {
	try {
	  // req.user is already set by the protectRoute middleware
	  res.status(200).json(req.user);
	} catch (error) {
	  console.log("Error in getMe controller", error.message);
	  res.status(500).json({ error: "Internal Server Error" });
	}
  };