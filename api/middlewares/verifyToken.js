const jwt = require("jsonwebtoken");
const config = require('../config');

module.exports = (req, res, next) => {
	// First string is "Bearer", next is JWT token
	let token = req.headers.authorization.split(" ")[1];

	if (!token)
		return res.status(401).json({ error: "Δεν δόθηκε JWT token" });

	jwt.verify(token, config.TOKEN_SECRET, (err, decoded) => {
		if (err)
			return res.status(401).json({ error: "Μη έγκυρο JWT token" });

		req.userId = decoded.id;
		next();
	});
};
