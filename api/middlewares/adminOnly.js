module.exports = async (req, res, next) => {
	if (!req.fromAdmin) {
		return res.status(403).json({ error: "Διαθέσιμο μόνο για διαχειριστές" });
	}

	next();
};
