import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		puzzlesCompleted: {
			type: Number,
			default: 0,
		},
		streaksStarted: {
			type: Number,
			default: 0,
		},
		streaksEnded: {
			type: Number,
			default: 0,
		},
		longestStreak: {
			type: Number,
			default: 0,
		},
		totalPuzzleAttempts: {
			type: Number,
			default: 0,
		},
		lastActivity: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;