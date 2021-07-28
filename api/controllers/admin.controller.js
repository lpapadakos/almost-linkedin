const jwt = require("jsonwebtoken");

const config = require("../config");
const User = require("../models/user.model");

exports.getAllUsers = async (req, res) => {
	// Requesting user id, decoded from JWT token: Check if admin
	const possibleAdmin = await User.findById(req.userId);
	if (!possibleAdmin || possibleAdmin.role != "admin")
		return res.status(403).json({ error: "Διαθέσιμο μόνο για διαχειριστές" });

	// Send the properties we want to be seen in the admin table, for all users
	res.status(200).json(await User.find({ role: "user" }, '_id name email joinDate'));
}

exports.exportUsers = async (req, res) => {
	// TODO export users that were requested, XML/JSON
}
