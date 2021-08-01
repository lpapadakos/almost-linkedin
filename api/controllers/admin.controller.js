const User = require("../models/user.model");

exports.getAllUsers = async (req, res) => {
	// Send the properties we want to be seen in the admin table, for all users
	res.status(200).json(await User.find({ role: "user" }, '_id name email joinDate'));
}

exports.exportUsers = async (req, res) => {
	const type = req.query.type || "xml";

	console.log(type);
	// TODO export users that were requested, XML/JSON
}
