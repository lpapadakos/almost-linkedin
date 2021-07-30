const jwt = require("jsonwebtoken");

const config = require('../config');
const User = require("../models/user.model");

module.exports = async (req, res, next) => {
	// First string is "Bearer", next is JWT token
	if (!req.headers.authorization)
		return res.status(401).json({ error: "Δεν δόθηκε token" });

	let token = req.headers.authorization.split(" ")[1];

	try {
		let decoded = await jwt.verify(token, config.TOKEN_SECRET);
		req.userId = decoded.id;

		// Check admin routes for authorization as well
		if (req.originalUrl.startsWith("/admin")) {
			const possibleAdmin = await User.findById(req.userId);
			if (!possibleAdmin || possibleAdmin.role != "admin")
				return res.status(403).json({ error: "Διαθέσιμο μόνο για διαχειριστές" });
		}
	} catch (err) {
		return res.status(401).json({ error: err.message });
	}

	next();
};
