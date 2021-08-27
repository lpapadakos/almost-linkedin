// Include Packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("morgan");
const fs = require("fs");
const https = require("https");

const unless = require("./middlewares/unless");

// Server Configuration
const config = require("./config");
const httpsOptions = {
	key: fs.readFileSync("./certs/selfsigned.key"),
	cert: fs.readFileSync("./certs/selfsigned.crt"),
};

// Connect to MongoDB
mongoose.connect(config.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false,
});
mongoose.connection.on("error", (err) => {
	console.error("Could not connect to MongoDB: " + err);
});

// Initialize the server itself
var server = express();

// Middleware
server.use(cors());
server.use(logger("dev"));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Require JWT token for all routes except login and register
server.use(unless(require("./middlewares/verifyToken"), "/users/register", "/users/login"));

// Set API endpoint routes
server.use("/files", express.static("uploads"));
server.use("/users", require("./routes/users.routes"));
server.use("/articles", require("./routes/articles.routes"));
// TODO server.use("/job-ads", require("./routes/job-ads.routes"));
server.use("/discussions", require("./routes/discussions.routes"));

// Error handler
server.use((err, req, res, next) => {
	// delegate to the default Express error handler, when the headers have already been sent to the client
	if (res.headersSent) return next(err);

	console.error(err.stack);
	res.status(500).json({ error: "Something happened: " + err });
});

// Start the server (HTTPS)
https.createServer(httpsOptions, server).listen(config.LISTEN_PORT, () => {
	console.log("Listening on port " + config.LISTEN_PORT);
});
