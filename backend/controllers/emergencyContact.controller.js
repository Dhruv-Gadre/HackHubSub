import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

// Add an emergency contact for a patient
export const addEmergencyContact = async (req, res) => {
	try {
		const { patientId, contactId } = req.body;

		// Check if the current user is a patient
		const patient = await User.findById(patientId);
		if (!patient || patient.role !== "patient") {
			return res.status(403).json({ error: "Only patients can add emergency contacts" });
		}

		// Check if the contact exists and is an emergency contact
		const contact = await User.findById(contactId);
		if (!contact || contact.role !== "emergency_contact") {
			return res.status(404).json({ error: "Emergency contact not found" });
		}

		// Add the contact to the patient's emergency contacts
		patient.emergencyContacts.push(contactId);
		await patient.save();

		res.status(200).json({ message: "Emergency contact added successfully", patient });
	} catch (error) {
		console.log("Error in addEmergencyContact: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Remove an emergency contact for a patient
export const removeEmergencyContact = async (req, res) => {
	try {
		const { patientId, contactId } = req.body;

		// Check if the current user is a patient
		const patient = await User.findById(patientId);
		if (!patient || patient.role !== "patient") {
			return res.status(403).json({ error: "Only patients can remove emergency contacts" });
		}

		// Remove the contact from the patient's emergency contacts
		patient.emergencyContacts = patient.emergencyContacts.filter(
			(contact) => contact.toString() !== contactId.toString()
		);
		await patient.save();

		res.status(200).json({ message: "Emergency contact removed successfully", patient });
	} catch (error) {
		console.log("Error in removeEmergencyContact: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Send an emergency alert to all emergency contacts
export const sendEmergencyAlert = async (req, res) => {
	try {
		const patientId = req.user._id;

		// Check if the current user is a patient
		const patient = await User.findById(patientId);
		if (!patient || patient.role !== "patient") {
			return res.status(403).json({ error: "Only patients can send emergency alerts" });
		}

		// Notify all emergency contacts
		for (const contactId of patient.emergencyContacts) {
			const notification = new Notification({
				from: patientId,
				to: contactId,
				type: "emergency",
				additionalData: {
					message: `${patient.username} has sent an emergency alert. Please check on them.`,
				},
			});
			await notification.save();
		}

		res.status(200).json({ message: "Emergency alert sent successfully" });
	} catch (error) {
		console.log("Error in sendEmergencyAlert: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};