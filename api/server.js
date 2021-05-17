// Include Packages
var express = require("express");
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var cors = require("cors");
var logger = require('morgan');
var fs = require('fs');
var https = require('https');

// Server Configuration
var config = require('./config');

var key = fs.readFileSync(__dirname + '/certs/selfsigned.key');
var cert = fs.readFileSync(__dirname + '/certs/selfsigned.crt');
var httpsOptions = {
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
mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', function (err) {
	console.log('Could not connect to MongoDB');
});

// TODO Load server routes
//require('./routes')(server);

//DEBUG say hi
server.get("/", (req, res) => {
	res.json({ message: "Όου τζιιζ" });
});

// Start the server (HTTPS)
https.createServer(httpsOptions, server).listen(config.LISTEN_PORT, function () {
	console.log("Listening on port " + config.LISTEN_PORT);
});
