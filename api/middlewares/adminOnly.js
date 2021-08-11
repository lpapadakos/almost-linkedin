const User = require("../models/user.model");

module.exports = async (req, res, next) => {
	const requestingUser = await User.findById(req.userId);

	if (!requestingUser || requestingUser.role !== "admin")
		return res.status(403).json({ error: "Διαθέσιμο μόνο για διαχειριστές" });

	next();
}
