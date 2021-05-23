const jwt = require("jsonwebtoken");

verifyToken = (req, res, next) => {
	let token = req.headers.authorization;

	if (!token)
		return res.status(403).send({ error: "No token provided" });

	jwt.verify(token, config.secret, (err, decoded) => {
		if (err)
			return res.status(401).send({ error: "Invalid token" });

		req.userId = decoded.id;
		next();
	});
};

module.exports = verifyToken;
