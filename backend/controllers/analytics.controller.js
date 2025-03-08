import Analytics from "../models/analytics.model.js";
import User from "../models/user.model.js";

// Get analytics for a user
export const getUserAnalytics = async (req, res) => {
	try {
		const userId = req.user._id;

		const analytics = await Analytics.findOne({ user: userId });
		if (!analytics) {
			return res.status(404).json({ error: "Analytics not found for this user" });
		}

		res.status(200).json(analytics);
	} catch (error) {
		console.log("Error in getUserAnalytics: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Update analytics when a puzzle is completed
export const updatePuzzleCompletion = async (req, res) => {
	try {
		const userId = req.user._id;

		const analytics = await Analytics.findOne({ user: userId });
		if (!analytics) {
			return res.status(404).json({ error: "Analytics not found for this user" });
		}

		analytics.puzzlesCompleted += 1;
		analytics.totalPuzzleAttempts += 1;
		analytics.lastActivity = new Date();
		await analytics.save();

		res.status(200).json(analytics);
	} catch (error) {
		console.log("Error in updatePuzzleCompletion: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Update analytics when a streak is started or ended
export const updateStreakAnalytics = async (req, res) => {
	try {
		const userId = req.user._id;
		const { action } = req.body; // "start" or "end"

		const analytics = await Analytics.findOne({ user: userId });
		if (!analytics) {
			return res.status(404).json({ error: "Analytics not found for this user" });
		}

		if (action === "start") {
			analytics.streaksStarted += 1;
		} else if (action === "end") {
			analytics.streaksEnded += 1;
			if (analytics.longestStreak < req.body.streakLength) {
				analytics.longestStreak = req.body.streakLength;
			}
		}

		analytics.lastActivity = new Date();
		await analytics.save();

		res.status(200).json(analytics);
	} catch (error) {
		console.log("Error in updateStreakAnalytics: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};