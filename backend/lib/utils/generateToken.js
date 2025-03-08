import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, role, res) => {
	const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
	  expiresIn: "15d",
	});
  
	res.cookie("jwt", token, {
	  httpOnly: true,
	  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
	  sameSite: "strict",
	});
  
	return token;
  };
