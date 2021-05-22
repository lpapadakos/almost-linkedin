const jwt = require("jsonwebtoken");

verifyToken = (req, res, next) => {
	let token = req.headers.authentication;

	if (!token)
		return res.status(403).send({ message: "No token provided" });

	jwt.verify(token, config.secret, (err, decoded) => {
		if (err)
			return res.status(401).send({ message: "Invalid token" });

		req.userId = decoded.id;
		next();
	});
};

module.exports = verifyToken;
