const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
	//tODO maybe this should be middleware?
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

	next();
};
