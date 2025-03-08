import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		// Fetch notifications for the user and populate the "from" field
		const notifications = await Notification.find({ to: userId })
			.populate({
				path: "from",
				select: "username profileImg role", // Include role for better context
			})
			.sort({ createdAt: -1 }); // Sort by most recent first

		// Mark all fetched notifications as read
		await Notification.updateMany({ to: userId }, { read: true });

		res.status(200).json(notifications);
	} catch (error) {
		console.log("Error in getNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const deleteNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		// Delete all notifications for the user
		await Notification.deleteMany({ to: userId });

		res.status(200).json({ message: "Notifications deleted successfully" });
	} catch (error) {
		console.log("Error in deleteNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const createNotification = async (req, res) => {
	try {
		const { to, type, additionalData } = req.body;

		// Validate notification type
		if (!["follow", "like", "emergency", "puzzle_reminder"].includes(type)) {
			return res.status(400).json({ error: "Invalid notification type" });
		}

		// Create the notification
		const notification = new Notification({
			from: req.user._id, // The sender is the currently logged-in user
			to,
			type,
			additionalData, // Optional field for additional data (e.g., puzzle details, emergency message)
		});

		await notification.save();

		res.status(201).json(notification);
	} catch (error) {
		console.log("Error in createNotification function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const markAsRead = async (req, res) => {
	try {
		const { notificationId } = req.params;

		// Mark a specific notification as read
		const notification = await Notification.findByIdAndUpdate(
			notificationId,
			{ read: true },
			{ new: true }
		);

		if (!notification) {
			return res.status(404).json({ error: "Notification not found" });
		}

		res.status(200).json(notification);
	} catch (error) {
		console.log("Error in markAsRead function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};