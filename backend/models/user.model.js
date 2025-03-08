import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
			minLength: 6,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		role: {
			type: String,
			default:"Patient"
		},
		emergencyContacts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		sobrietyStreak: {
			type: Number,
			default: 0,
		},
		lastPuzzleCompletion: {
			type: Date,
			default: null,
		},
		puzzleSchedule: [
			{
				type: String,
				default: ["09:00", "15:00", "21:00"],
			},
		],
		followers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		profileImg: {
			type: String,
			default: "",
		},
		coverImg: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "",
		},
		link: {
			type: String,
			default: "",
		},
		likedPosts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post",
				default: [],
			},
		],
		rewards: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Reward",
				default: [],
			},
		],
		age: { 
			type: Number, 
			required: true
		},
		familyStructure: {
				values: {
					type: [Number], 
					default: [0, 0, 0, 0, 0] 
				}, 
				weights: { 
					type: Number, 
					default: 0
				}
			},
		socioEcoStats: {
				values: { 
					type: [Number], 
					default: [0, 0, 0, 0, 0] 
				},
				weights: { 
					type: Number, 
					default: 0
				}
		},
		relationship: {
				values: { 
					type: [Number], 
					default: [0, 0, 0, 0, 0] 
				},
				weights: { 
					type: Number, 
					default: 0
				}
		},
		healthSupport: {
			values: { 
					type: [Number], 
					default: [0, 0, 0, 0, 0] 
				},
				weights: { 
					type: Number, 
					default: 0
				}
			},
			sadPerson: {
				values: { 
					type: [Number], 
					default: [0, 0, 0, 0, 0] 
				},
				weights: { 
					type: Number, 
					default: 0
				}
			},
		additional: {
				values: { 
					type: [Number], 
					default: [0, 0, 0, 0, 0] 
				},
				weights: { 
					type: Number,
					default: 0 
				}
		},
		doctorDesc: { 
			type: String 
		},
		doctor: { 
			type: mongoose.Schema.Types.ObjectId, 
			ref: "Doctor", 
			required: true 
		},
			
		sobrietyStreak: { 
			type: Number, 
			default: 0 
		},
		lastUpdated: { 
			type: Date, 
			default: null 
		},
		streakHistory: [{ 
			type: Date
		}],
		location: {
			type: {
				type: String,
				enum: ["Point"],
				required: true
			},
			coordinates: {
				type: [Number],
				required: true
			}
		},
	},
	{ timestamps: true }
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);

export default User;