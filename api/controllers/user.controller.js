const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const config = require("../config");
const User = require("../models/user.model");

exports.login = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });

		if (!user)
			return res.status(401).json({ error: "Λάθος διεύθυνση email ή κωδικός πρόσβασης" });

		const passwordMatch = await bcrypt.compare(req.body.password, user.password);
		if (!passwordMatch)
			return res.status(401).json({ error: "Λάθος διεύθυνση email ή κωδικός πρόσβασης" });

		const token = jwt.sign({ id: user._id }, config.TOKEN_SECRET, { expiresIn: '1d'	});

		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			joinDate: user.joinDate,
			token: token
		});
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η σύνδεση χρήστη: " + err });
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

		// DEBUG Log newly created user
		console.log(user);

		await user.save();
		res.status(201).json({ message: "Επιτυχής εγγραφή χρήστη" });
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η εγγραφή χρήστη: " + err });
	}
};

exports.getById = async (req, res) => {
	const user = await User.findById(req.params.id);

	// TODO dont send everything (e.g. password)!
	if (user)
		res.status(200).json(user);
	else
		res.status(404).json({ error: "Δεν βρέθηκε ο χρήστης" });
}
