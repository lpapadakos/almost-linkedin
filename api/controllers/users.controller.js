const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const config = require("../config");
const { User, Contact } = require("../models/user.model");

exports.register = async (req, res) => {
	try {
		// role is not defined during registration. It's 'user'. Admin is preinstalled
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			password: await bcrypt.hash(req.body.password, 10),
			phone: req.body.phone,
			img: req.file.filename,
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

		if (!user) return res.status(401).json({ error: "Λάθος διεύθυνση email ή κωδικός πρόσβασης" });

		const passwordMatch = await bcrypt.compare(req.body.password, user.password);
		if (!passwordMatch) return res.status(401).json({ error: "Λάθος διεύθυνση email ή κωδικός πρόσβασης" });

		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			img: user.img,
			joinDate: user.joinDate,
			token: await jwt.sign({ id: user._id }, config.TOKEN_SECRET, { expiresIn: "1d" }),
		});
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η σύνδεση χρήστη: " + err });
	}
};

exports.get = async (req, res) => {
	try {
		let filter = { role: "user" };

		if (req.params.userId)
			filter._id = req.params.userId;

		let users = await User.find(filter, "_id name img joinDate experience education skills");

		users.forEach((user) => {
			// Find if requesting user and user we're GETting are in the same network
			const isContact = Contact.exists({
				$and: [
					{ accepted: true },
					{
						$or: [
							{ sender: req.userId, receiver: req.params.userId },
							{ sender: req.params.userId, receiver: req.userId },
						],
					},
				],
			});

			// Keep protected info from public view
			if (!isContact) {
				if (!user.experience.public)
					delete user.experience;

				if (!user.education.public)
					delete user.education;

				if (!user.skills.public)
					delete user.skills;
			}
		});

		if (req.params.userId) {
			if (users)
				return res.status(200).json(users[0]);
			else
				return res.status(404).json({ error: "Δεν βρέθηκε ο χρήστης" })
		}

		res.status(200).json(users);
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αναζήτηση χρηστών: " + err });
	}
};

exports.export = async (req, res) => {
	const type = req.query.type || "xml";

	console.log(type);
	// TODO export users that were requested, XML/JSON
};
