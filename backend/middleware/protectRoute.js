import User from "../models/user.model.js";
import Doctor from "../models/doctors.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized: Invalid Token" });
    }

    // Check if the user exists in either model
    let user = await User.findById(decoded.userId).select("-password");
    let isDoctor = false;

    // If not found in User model, try the Doctor model
    if (!user) {
      user = await Doctor.findById(decoded.userId).select("-password");
      isDoctor = true;
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Make sure role is set properly
    if (isDoctor && !user.role) {
      user.role = "Doctor";
    } else if (!isDoctor && !user.role) {
      user.role = "Patient";
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("Error in protectRoute middleware", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};