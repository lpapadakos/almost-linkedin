// Include Packages
const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require('morgan');
const fs = require('fs');
const https = require('https');

// Server Configuration
const config = require('./config');

// Routes
const userRoutes = require('./routes/user.routes');

const key = fs.readFileSync('./certs/selfsigned.key');
const cert = fs.readFileSync('./certs/selfsigned.crt');
const httpsOptions = {
	key: key,
	cert: cert
};

// Initialize the application
var server = express();
server.use(cors());
server.use(logger('dev'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true,  useCreateIndex: true });
mongoose.connection.on('error', err => {
	console.log('Could not connect to MongoDB');
});

// Allowed headers
server.use((req, res, next) => {
	res.header(
		"Access-Control-Allow-Headers",
		"x-access-token, Origin, Content-Type, Accept"
	);
	next();
});

// Set server routes
server.use('/api/user', userRoutes);

//DEBUG say hi
server.get("/", (req, res) => {
	res.json({ message: "Όου τζιιζ" });
});

// Start the server (HTTPS)
https.createServer(httpsOptions, server).listen(config.LISTEN_PORT, () => {
	console.log("Listening on port " + config.LISTEN_PORT);
});
