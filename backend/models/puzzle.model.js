import mongoose from "mongoose";

const puzzleSchema = new mongoose.Schema(
	{
		patient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		question: {
			type: String,
			required: true,
		},
		answer: {
			type: String,
			required: true,
		},
		completed: {
			type: Boolean,
			default: false,
		},
		scheduledTime: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true }
);

const Puzzle = mongoose.model("Puzzle", puzzleSchema);

export default Puzzle;