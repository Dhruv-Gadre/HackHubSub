import Doctor from "../models/doctors.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const doctorSignup = async (req, res) => {
    try {
        const { fullName,username, email, password, patients, location, bio } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !username) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Check if email already exists
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ message: "Email already in use." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if location is provided
        if (!location || !location.type || !location.coordinates) {
            return res.status(400).json({ message: "Location is required from frontend." });
        }

        // Ensure GeoJSON format is correct
        if (location.type !== "Point" || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
            return res.status(400).json({ message: "Invalid location format." });
        }

        // Create new doctor instance
        const newDoctor = new Doctor({
            fullName,
            username,
            email,
            password: hashedPassword,
            patients: patients || [],
            location,
            bio
        });

        // Save doctor to database
        await newDoctor.save();
        return res.status(201).json({ message: "Doctor registered successfully.", doctor: newDoctor });
    } catch (error) {
        console.error("Error registering doctor:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

export const doctorLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log("📌 Received Login Request:", req.body); // Debugging

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ message: "Missing username or password." });
        }

        // Find doctor by username or email
        const doctor = await Doctor.findOne({
            $or: [{ email: username }, { username: username }]
        });

        if (!doctor) {
            console.log("❌ Doctor not found");
            return res.status(404).json({ message: "Doctor not found." });
        }

        console.log("✅ Doctor found:", doctor.fullName);

        // Compare password
        const isMatch = await bcrypt.compare(password, doctor.password);
        console.log("✅ Password Match:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Generate JWT token and set cookie
        const token = generateTokenAndSetCookie(doctor._id, "Doctor", res);
        // Send response in correct format
        return res.status(200).json({
            message: "Login successful",
            _id: doctor._id,
            fullName: doctor.fullName,
            username: doctor.username,
            email: doctor.email,
            role: doctor.role,
        });

    } catch (error) {
        console.error("❌ Error logging in doctor:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

export const getDoctorPatients = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Validate doctorId
        if (!doctorId) {
            return res.status(400).json({ message: "Doctor ID is required." });
        }

        // Find the doctor and populate the patients
        const doctor = await Doctor.findById(doctorId).populate("patients");

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found." });
        }

        return res.status(200).json({ patients: doctor.patients });
    } catch (error) {
        console.error("Error fetching doctor's patients:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};