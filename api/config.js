module.exports = {
	// 1. MongoDB
	MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost/almostlinkedin',

	// 2. JWT
	TOKEN_SECRET: process.env.TOKEN_SECRET || 'Koh5Uakofae8ahph4koo6yohyievahhae5Ox0ooyeeth0sai3zochi4shu3faiC5',

	// 3. Express Server Port
	LISTEN_PORT: process.env.LISTEN_PORT || 3443
};
