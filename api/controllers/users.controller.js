const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const config = require("../config");
const { Entry, User, Contact } = require("../models/user.model");

// TODO use brackets on most ifs
exports.register = async (req, res, next) => {
	try {
		// role is not defined during registration. It's 'user'. Admin is preinstalled
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			password: await bcrypt.hash(req.body.password, 10),
			phone: req.body.phone,
		});

		if (req.file) user.img = req.file.filename;
		else user.img = "default_avatar";

		await user.save();
		res.status(201).json({ message: "Επιτυχής εγγραφή χρήστη" });
	} catch (err) {
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		const user = await User.findOne({ email: req.body.email });

		if (!user) return res.status(401).json({ error: "Λάθος διεύθυνση email ή κωδικός πρόσβασης" });

		const passwordMatch = await bcrypt.compare(req.body.password, user.password);
		if (!passwordMatch) return res.status(401).json({ error: "Λάθος διεύθυνση email ή κωδικός πρόσβασης" });

		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			role: user.role,
			img: user.img,
			lastDiscussion: user.lastDiscussion,
			createdAt: user.createdAt,
			token: await jwt.sign({ id: user._id }, config.TOKEN_SECRET, { expiresIn: "1d" }),
		});
	} catch (err) {
		next(err);
	}
};

exports.get = async (req, res, next) => {
	try {
		let filter = { role: "user" };

		if (req.params.userId) filter._id = req.params.userId;

		let users = await User.find(filter, "_id name email phone img experience education skills createdAt").sort({ name: "asc" }).lean();

		await Promise.all(
			users.map(async (user) => {
				// Find if requesting user and user we're GETting are in the same network
				const contact = await Contact.findOne({
					$or: [
						{ sender: req.userId, receiver: user._id },
						{ sender: user._id, receiver: req.userId },
					],
				});

				// Add non-db field to make frontend client's life easier
				if (contact) {
					user.contact = { _id: contact._id, accepted: contact.accepted };
				}

				// Keep protected info from public view, with 3 exceptions
				const daijobu = req.fromAdmin || user._id == req.userId || (contact && contact.accepted);

				if (daijobu || user.experience.public) {
					await user.experience.entries.sort((e1, e2) => e2.fromYear - e1.fromYear);
				} else {
					user.experience.entries = [];
				}

				if (daijobu || user.education.public) {
					await user.education.entries.sort((e1, e2) => e2.fromYear - e1.fromYear);
				} else {
					user.education.entries = [];
				}

				if (!daijobu && !user.skills.public) user.skills.entries = [];
			})
		);

		if (req.params.userId) {
			if (users) return res.status(200).json(users[0]);
			else return res.status(404).json({ error: "Δεν βρέθηκε ο χρήστης" });
		}

		res.status(200).json(users);
	} catch (err) {
		next(err);
	}
};

exports.addContactRequest = async (req, res, next) => {
	try {
		if (req.params.userId === req.userId) {
			return res.status(400).json({ error: "Δεν χρειάζεται να γίνει αίτημα σύνδεσης προς τον ίδιο το χρήστη" });
		}

		const existingRequest = await Contact.exists({
			$or: [
				{ sender: req.userId, receiver: req.params.userId },
				{ sender: req.params.userId, receiver: req.userId },
			],
		});

		if (existingRequest) return res.status(409).json({ error: "Έχει ήδη γίνει αίτημα σύνδεσης" });

		const request = new Contact({
			sender: req.userId,
			receiver: req.params.userId,
		});

		await request.save();
		res.status(201).json(request);
	} catch (err) {
		next(err);
	}
};

exports.getContactRequests = async (req, res, next) => {
	try {
		res.status(200).json(await Contact.find({ receiver: req.params.userId, accepted: false }, "_id sender").populate("sender", "_id name img"));
	} catch (err) {
		next(err);
	}
};

exports.acceptContactRequest = async (req, res, next) => {
	try {
		// Can only accept requests sent to us
		await Contact.updateOne({ _id: req.params.requestId, receiver: req.params.userId }, { accepted: true });
		res.status(200).json({ message: "Αποδοχή αιτήματος σύνδεσης" });
	} catch (err) {
		next(err);
	}
};

exports.deleteContactRequest = async (req, res, next) => {
	try {
		// Can only delete requests sent to us or received by us (to end contact)
		await Contact.deleteOne({
			$and: [
				{ _id: req.params.requestId },
				{
					$or: [{ sender: req.params.userId }, { receiver: req.params.userId }],
				},
			],
		});

		res.status(204).json({ message: "Διαγραφή αιτήματος σύνδεσης" });
	} catch (err) {
		next(err);
	}
};

exports.getContacts = async (req, res, next) => {
	try {
		// Can peep only at the network of ourselves or our contacts
		if (req.params.userId !== req.userId) {
			const isContact = await Contact.exists({
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

			if (!isContact) return res.status(403).json({ error: "Δεν έχετε την άδεια για προβολή δικτύου του χρήστη" });
		}

		const sentContacts = await Contact.find({ sender: req.params.userId, accepted: true }, "receiver interactions").populate(
			"receiver",
			"_id name img createdAt experience education skills"
		);

		const receivedContacts = await Contact.find({ receiver: req.params.userId, accepted: true }, "sender interactions").populate(
			"sender",
			"_id name img createdAt experience education skills"
		);

		let contacts = [].concat(sentContacts).concat(receivedContacts);

		// Sort contacts descending by number of interactions
		await contacts.sort((c1, c2) => c2.interactions - c1.interactions);

		// Send user info cleanly
		let usersOnly = contacts.map((contact) => {
			// return the defined field
			return contact.sender || contact.receiver;
		});

		res.status(200).json(usersOnly);
	} catch (err) {
		next(err);
	}
};

exports.addEntry = async (req, res, next) => {
	try {
		const entry = new Entry(req.body);
		await User.updateOne({ _id: req.params.userId }, { $push: { [`${req.params.entryType}.entries`]: entry } });

		res.status(201).json(entry);
	} catch (err) {
		next(err);
	}
};

exports.changeEntryStatus = async (req, res, next) => {
	try {
		await User.updateOne({ _id: req.params.userId }, { [`${req.params.entryType}.public`]: req.body.public });
		res.status(200).json({ message: "Επιτυχής αλλαγή ιδιωτικότητας δεδομένων προφίλ" });
	} catch (err) {
		next(err);
	}
};

exports.deleteEntry = async (req, res, next) => {
	try {
		await User.updateOne({ _id: req.params.userId }, { $pull: { [`${req.params.entryType}.entries`]: { _id: req.params.entryId } } });
		res.status(204).json({ message: "Διαγράφτηκε το δεδομένο προφίλ" });
	} catch (err) {
		next(err);
	}
};

exports.export = async (req, res, next) => {
	try {
		const type = req.query.type || "xml";

		console.log(type);
		// TODO export users that were requested, XML/JSON
	} catch (err) {
		next(err);
	}
};
