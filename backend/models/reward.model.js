import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		streakMilestone: {
			type: Number,
			required: true,
		},
		rewardType: {
			type: String,
			required: true,
			enum: ["badge", "points", "discount"],
		},
		rewardValue: {
			type: Number,
			required: true,
		},
		claimed: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const Reward = mongoose.model("Reward", rewardSchema);

export default Reward;