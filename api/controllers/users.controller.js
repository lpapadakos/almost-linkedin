const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const config = require("../config");
const User = require("../models/user.model");

exports.register = async (req, res) => {
	try {
		// role is not defined during registration. It's 'user'. Admin is preinstalled
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			password: await bcrypt.hash(req.body.password, 10),
			phone: req.body.phone,
			img: req.file.filename
		});

		await user.save();
		res.status(201).json({ message: "Επιτυχής εγγραφή χρήστη" });
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η εγγραφή χρήστη: " + err });
	}
};

exports.login = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });

		if (!user)
			return res.status(401).json({ error: "Λάθος διεύθυνση email ή κωδικός πρόσβασης" });

		const passwordMatch = await bcrypt.compare(req.body.password, user.password);
		if (!passwordMatch)
			return res.status(401).json({ error: "Λάθος διεύθυνση email ή κωδικός πρόσβασης" });

		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			img: user.img,
			joinDate: user.joinDate,
			token: await jwt.sign({ id: user._id }, config.TOKEN_SECRET, { expiresIn: '1d' })
		});
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η σύνδεση χρήστη: " + err });
	}
};

// Used for profile info
exports.getById = async (req, res) => {
	try {
		const user = await User.findById(req.params.userId, '_id name email phone joinDate experience education skills');

		// TODO find if friend to hide private info etc

		if (user)
			res.status(200).json(user);
		else
			res.status(404).json({ error: "Δεν βρέθηκε ο χρήστης" });
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αναζήτηση προφίλ χρήστη: " + err });
	}
}

exports.getAll = async (req, res) => {
	// Send the properties we want to be seen in the admin table, for all users
	res.status(200).json(await User.find({ role: "user" }, '_id name email joinDate'));
}

exports.export = async (req, res) => {
	const type = req.query.type || "xml";

	console.log(type);
	// TODO export users that were requested, XML/JSON
}
