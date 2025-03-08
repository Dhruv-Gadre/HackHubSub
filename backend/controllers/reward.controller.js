import Reward from "../models/reward.model.js";
import User from "../models/user.model.js";

// Award a reward for reaching a streak milestone
export const awardStreakReward = async (req, res) => {
	try {
		const userId = req.user._id;
		const { streakMilestone } = req.body;

		// Define rewards based on milestones
		const rewardsMap = {
			7: { type: "badge", value: "7-Day Streak Badge" },
			30: { type: "points", value: 100 },
			90: { type: "discount", value: 10 }, // 10% discount
		};

		if (!rewardsMap[streakMilestone]) {
			return res.status(400).json({ error: "No reward defined for this milestone" });
		}

		// Create the reward
		const newReward = new Reward({
			user: userId,
			streakMilestone,
			rewardType: rewardsMap[streakMilestone].type,
			rewardValue: rewardsMap[streakMilestone].value,
		});

		await newReward.save();

		// Add the reward to the user's rewards list
		const user = await User.findById(userId);
		user.rewards.push(newReward._id);
		await user.save();

		res.status(201).json(newReward);
	} catch (error) {
		console.log("Error in awardStreakReward: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get all rewards for a user
export const getUserRewards = async (req, res) => {
	try {
		const userId = req.user._id;

		const rewards = await Reward.find({ user: userId }).sort({ createdAt: -1 });

		res.status(200).json(rewards);
	} catch (error) {
		console.log("Error in getUserRewards: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};