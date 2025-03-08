import User from "../models/user.model.js";
import { awardStreakReward } from "./reward.controller.js";

// Start a new sobriety streak for a patient
export const startStreak = async (req, res) => {
    try {
        const patientId = req.user._id;

        // Check if the user is a patient
        const patient = await User.findById(patientId);
        if (!patient || patient.role !== "Patient") {
            return res.status(403).json({ error: "Only patients can start a sobriety streak" });
        }

        // Reset the patient's sobriety streak and history
        patient.sobrietyStreak = 0;
        patient.streakHistory = [];
        patient.lastUpdated = new Date();
        
        await patient.save();

        res.status(201).json({ 
            message: "New sobriety streak started successfully",
            sobrietyStreak: patient.sobrietyStreak,
            lastUpdated: patient.lastUpdated
        });
    } catch (error) {
        console.log("Error in startStreak: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get streak information for a patient
export const getPatientStreak = async (req, res) => {
    try {
        const patientId = req.user._id;

        const patient = await User.findById(patientId)
            .select('sobrietyStreak streakHistory lastUpdated');

        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        res.status(200).json({
            sobrietyStreak: patient.sobrietyStreak,
            streakHistory: patient.streakHistory,
            lastUpdated: patient.lastUpdated
        });
    } catch (error) {
        console.log("Error in getPatientStreak: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// End the current sobriety streak for a patient
export const endStreak = async (req, res) => {
    try {
        const patientId = req.user._id;

        // Find the patient
        const patient = await User.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        // Check if there's an active streak
        if (patient.sobrietyStreak === 0) {
            return res.status(400).json({ error: "No active streak to end" });
        }

        // Store the final streak length before resetting
        const finalStreakLength = patient.sobrietyStreak;

        // Reset the streak
        patient.sobrietyStreak = 0;
        patient.lastUpdated = new Date();
        await patient.save();

        // Award rewards if a milestone was reached
        const milestones = [7, 30, 90]; // Define milestones
        for (const milestone of milestones) {
            if (finalStreakLength >= milestone) {
                await awardStreakReward(patientId, milestone);
            }
        }

        res.status(200).json({ 
            message: "Streak ended successfully", 
            finalStreakLength 
        });
    } catch (error) {
        console.log("Error in endStreak: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Continue the streak by incrementing the counter and recording the date
export const continueStreak = async (req, res) => {
    try {
        const patientId = req._id;
 
        // Find the patient
        const patient = await User.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        if (patient.role !== "Patient") {
            return res.status(403).json({ error: "Only patients can continue a sobriety streak" });
        }

        // Check if we should allow the continuation (prevent multiple updates on the same day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);  // Normalize to start of day
        
        const lastUpdate = patient.lastUpdated ? new Date(patient.lastUpdated) : null;
        if (lastUpdate) {
            const lastUpdateDay = new Date(lastUpdate);
            lastUpdateDay.setHours(0, 0, 0, 0);  // Normalize to start of day
            
            if (lastUpdateDay.getTime() === today.getTime()) {
                return res.status(400).json({ 
                    error: "Streak already updated today", 
                    sobrietyStreak: patient.sobrietyStreak 
                });
            }
        }

        // Increment the streak counter
        patient.sobrietyStreak += 1;
        
        // Add today's date to streak history
        const currentDate = new Date();
        patient.streakHistory.push(currentDate);
        
        // Update the last updated timestamp
        patient.lastUpdated = currentDate;
        
        await patient.save();

        // Check if a milestone is reached
        const milestones = [7, 30, 90]; // Define milestones
        if (milestones.includes(patient.sobrietyStreak)) {
            await awardStreakReward(patientId, patient.sobrietyStreak);
        }

        res.status(200).json({ 
            message: "Streak continued successfully", 
            sobrietyStreak: patient.sobrietyStreak,
            lastUpdated: patient.lastUpdated
        });
    } catch (error) {
        console.log("Error in continueStreak: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};