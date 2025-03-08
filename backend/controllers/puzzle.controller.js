import Puzzle from "../models/puzzle.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

// Create a new puzzle for a patient
export const createPuzzle = async (req, res) => {
	try {
		const { patientId, question, answer, scheduledTime } = req.body;

		// Validate input
		if (!patientId || !question || !answer || !scheduledTime) {
			return res.status(400).json({ error: "All fields are required" });
		}

		// Check if the patient exists
		const patient = await User.findById(patientId);
		if (!patient || patient.role !== "patient") {
			return res.status(404).json({ error: "Patient not found" });
		}

		// Create the puzzle
		const newPuzzle = new Puzzle({
			patient: patientId,
			question,
			answer,
			scheduledTime: new Date(scheduledTime),
		});

		await newPuzzle.save();

		// Notify the patient about the new puzzle
		const notification = new Notification({
			from: req.user._id, // The doctor or system creating the puzzle
			to: patientId,
			type: "puzzle_reminder",
			additionalData: {
				message: `A new puzzle is available for you.`,
				puzzleId: newPuzzle._id,
			},
		});
		await notification.save();

		res.status(201).json(newPuzzle);
	} catch (error) {
		console.log("Error in createPuzzle: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Mark a puzzle as completed by a patient
export const completePuzzle = async (req, res) => {
	try {
		const { puzzleId, patientAnswer } = req.body;
		const patientId = req.user._id;

		// Find the puzzle
		const puzzle = await Puzzle.findById(puzzleId);
		if (!puzzle) {
			return res.status(404).json({ error: "Puzzle not found" });
		}

		// Check if the patient is authorized to complete this puzzle
		if (puzzle.patient.toString() !== patientId.toString()) {
			return res.status(403).json({ error: "You are not authorized to complete this puzzle" });
		}

		// Check if the answer is correct
		if (patientAnswer !== puzzle.answer) {
			return res.status(400).json({ error: "Incorrect answer" });
		}

		// Mark the puzzle as completed
		puzzle.completed = true;
		await puzzle.save();

		// Update the patient's sobriety streak
		const patient = await User.findById(patientId);
		patient.sobrietyStreak += 1;
		await patient.save();

		// Notify the doctor about the completed puzzle
		const doctor = await User.findOne({ role: "doctor", patients: patientId });
		if (doctor) {
			const notification = new Notification({
				from: patientId,
				to: doctor._id,
				type: "puzzle_reminder",
				additionalData: {
					message: `${patient.username} has completed a puzzle.`,
					puzzleId: puzzle._id,
				},
			});
			await notification.save();
		}

		res.status(200).json({ message: "Puzzle completed successfully", puzzle });
	} catch (error) {
		console.log("Error in completePuzzle: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get all puzzles for a patient
export const getPatientPuzzles = async (req, res) => {
	try {
		const patientId = req.user._id;

		const puzzles = await Puzzle.find({ patient: patientId }).sort({ scheduledTime: 1 });

		res.status(200).json(puzzles);
	} catch (error) {
		console.log("Error in getPatientPuzzles: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};