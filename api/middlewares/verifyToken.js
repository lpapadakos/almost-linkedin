const jwt = require("jsonwebtoken");

const config = require("../config");
const { User } = require("../models/user.model");

module.exports = async (req, res, next) => {
	if (!req.headers.authorization) {
		return res.status(401).json({ error: "Δεν έχει γίνει αυθεντικοποίηση" });
	}

	// First string is "Bearer", next is JWT token
	const token = req.headers.authorization.split(" ")[1];

	try {
		const decoded = await jwt.verify(token, config.TOKEN_SECRET);
		req.userId = decoded.id;
	} catch (err) {
		return res.status(401).json({ error: err.message });
	}

	const requestingUser = await User.findById(req.userId);

	if (requestingUser && requestingUser.role === "admin") {
		req.fromAdmin = true;
	}

	next();
};
