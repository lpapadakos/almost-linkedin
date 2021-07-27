const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/user.model");
const config = require("../config");

exports.login = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });

		// Deliberately don't inform users on the existence of emails
		if (!user)
			return res.status(401).json({ error: "Λάθος διεύθυνση email ή κωδικός πρόσβασης" });

		const passwordMatch = await bcrypt.compare(req.body.password, user.password);
		if (!passwordMatch)
			return res.status(401).json({ error: "Λάθος διεύθυνση email ή κωδικός πρόσβασης" });

		const token = jwt.sign({ id: user._id }, config.TOKEN_SECRET, { expiresIn: '1d'	});

		res.status(200).json({
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			joinDate: user.joinDate,
			token: token
		});
	} catch (err) {
		return res.status(500).json({ error: "Απέτυχε η σύνδεση χρήστη: " + err });
	}
};

exports.register = async (req, res) => {
	try {
		// role is not defined during registration. It's 'user'. Admin is preinstalled
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			phone: req.body.phone,
			img: req.body.img //TODO any special handling needed for img?
		});

		// Hash password before save
		user.password = await bcrypt.hash(req.body.password, 10);

		// DEBUG
		console.log(user);

		await user.save();
		res.status(201);
	} catch (err) {
		//TODO: Maybe not specific message for security? EXCEPTION: Uniqueness
		return res.status(500).json({ error: "Απέτυχε η εγγραφή χρήστη: " + err });
	}
};
