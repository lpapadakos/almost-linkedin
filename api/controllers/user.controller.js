const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validationResult = require("express-validator");

const User = require("../models/user.model");
const config = require("../config");

exports.register = async (req, res) => {
	// TODO? role is not defined during registration. It's 'user'
	const user = new User(req.body);

	// Hash password before save
	user.password = await bcrypt.hash(req.body.password, 10);

	// DEBUG
	console.log(user);

	try {
		await user.save();
	} catch (err) {
		//TODO: Maybe not specific message for security? EXCEPTION: Uniqueness
		return res.status(500).json({ error: "Απέτυχε η εγγραφή χρήστη: " + err });
	}

	res.status(201).json({ message: "Δημιουργήθηκε νέος χρήστης" });
};

exports.login = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });
	} catch (err) {
		return res.status(500).json({ error: "Απέτυχε η σύνδεση χρήστη" + err });
	}

	// Deliberately don't inform users on the existence of emails
	if (!user)
		return res.status(401).json({ error: "Λάθος όνομα χρήστη ή κωδικός πρόσβασης" });

	const passwordMatch = await bcrypt.compare(req.body.password, user.password);
	if (!passwordMatch)
		return res.status(401).json({ error: "Λάθος όνομα χρήστη ή κωδικός πρόσβασης" });

	const token = jwt.sign({ name: user.name, email: req.body.email }, config.TOKEN_SECRET, {
		expiresIn: 86400, // 1 day
	});

	res.status(200).json({
		message: "Επιτυχής σύνδεση χρήστη",
		token: token,
	});
};
