import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

// Import routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import rewardRoutes from "./routes/reward.route.js";
import puzzleRoutes from "./routes/puzzle.route.js";
import streakRoutes from "./routes/streak.route.js";

// Database connection
import connectMongoDB from "./db/connectMongoDB.js";
import cors from "cors";



// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;
const __dirname = path.resolve();

// Middleware
app.use(express.json({ limit: "5mb" })); // Parse JSON bodies (limit size to prevent DOS)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(cookieParser()); // Parse cookies

app.use(
    cors({
        origin: "http://localhost:3000",  // Your frontend URL
        credentials: true, // ✅ Allows sending cookies from frontend
    })
);


// Routes
app.use("/api/auth", authRoutes); 
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes); 
app.use("/api/rewards", rewardRoutes);
app.use("/api/puzzles", puzzleRoutes);
app.use("/api/streaks", streakRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	// Serve the frontend's index.html for all other routes
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	connectMongoDB(); // Connect to MongoDB
});