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
			createdAt: user.createdAt,
			token: await jwt.sign({ id: user._id }, config.TOKEN_SECRET, { expiresIn: "1d" }),
		});
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η σύνδεση χρήστη: " + err });
	}
};

exports.get = async (req, res) => {
	try {
		let filter = { role: "user" };

		// When getting all users, exclude requesting user from the list
		if (req.params.userId)
			filter._id = req.params.userId;
		else
			filter._id = { $ne: req.userId };

		let users = await User.find(filter, "_id name email img createdAt experience education skills").lean();

		await Promise.all(users.map(async (user) => {
			if (user._id !== req.userId && !req.fromAdmin)
				delete user.email;

			// Find if requesting user and user we're GETting are in the same network
			const contact = await Contact.findOne({
				$or: [
					{ sender: req.userId, receiver: user._id },
					{ sender: user._id, receiver: req.userId },
				]
			});

			// Add non-db field to make frontend client's life easier
			if (contact)
 				user.contact = { _id: contact._id, accepted: contact.accepted };

			// Keep protected info from public view
			if (!contact || contact.accepted == false) {
				if (!user.experience.public)
					delete user.experience;

				if (!user.education.public)
					delete user.education;

				if (!user.skills.public)
					delete user.skills;
			}
		}));

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

exports.addContactRequest = async (req, res) => {
	try {
		if (req.params.userId === req.userId)
			return res.status(400).json({ error: "Δεν χρειάζεται να γίνει αίτημα σύνδεσης προς τον ίδιο το χρήστη" });

		const existingRequest = await Contact.exists({
			$or: [
				{ sender: req.userId, receiver: req.params.userId },
				{ sender: req.params.userId, receiver: req.userId },
			]
		});

		if (existingRequest)
			return res.status(409).json({ error: "Έχει ήδη γίνει αίτημα σύνδεσης" });

		const request = new Contact({
			sender: req.userId,
			receiver: req.params.userId
		});

		await request.save();
		res.status(201).json(request);
	} catch(err) {
		res.status(500).json({ error: "Απέτυχε η δημιουργία αιτήματος σύνδεσης: " + err });
	}
}

exports.getContactRequests = async (req, res) => {
	try {
		if (req.params.userId !== req.userId)
			return res.status(403).json({ error: "Δεν έχετε την άδεια για προβολή αιτημάτων σύνδεσης του χρήστη" });

		res.status(200).json(await Contact.find(
			{ receiver: req.params.userId, accepted: false },
			"_id sender"
		).populate("sender", "_id name img"));
	} catch(err) {
		res.status(500).json({ error: "Απέτυχε η προβολή αιτημάτων σύνδεσης: " + err });
	}
}

exports.acceptContactRequest = async (req, res) => {
	try {
		if (req.params.userId !== req.userId)
			return res.status(403).json({ error: "Δεν έχετε την άδεια για αποδοχή αιτημάτων σύνδεσης του χρήστη" });

		// Can only accept requests sent to us
		await Contact.updateOne(
			{ _id: req.params.requestId, receiver: req.params.userId },
			{ accepted: true }
		);

		res.status(200).json({ message: "Αποδοχή αιτήματος σύνδεσης" });
	} catch(err) {
		res.status(500).json({ error: "Απέτυχε η αποδοχή αιτημάτος σύνδεσης: " + err });
	}
}

exports.deleteContactRequest = async (req, res) => {
	try {
		if (req.params.userId !== req.userId)
			return res.status(403).json({ error: "Δεν έχετε την άδεια για απόρριψη αιτημάτων σύνδεσης του χρήστη" });

		// Can only delete requests sent to us or received by us (to end contact)
		await Contact.deleteOne({
			$and: [
				{ _id: req.params.requestId },
				{
					$or: [
						{ sender: req.params.userId },
						{ receiver: req.params.userId }
					]
				}
			]
		});

		res.status(204).json({ message: "Διαγραφή αιτήματος σύνδεσης" });
	} catch(err) {
		res.status(500).json({ error: "Απέτυχε η διαγραφή αιτημάτος σύνδεσης: " + err });
	}
}

exports.getContacts = async (req, res) => {
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

			if (!isContact)
				return res.status(403).json({ error: "Δεν έχετε την άδεια για προβολή δικτύου του χρήστη" });
		}

		const sentContacts = await Contact.find(
			{ sender: req.params.userId, accepted: true },
			"receiver interactions"
		).populate("receiver", "_id name img createdAt experience education skills");

		const receivedContacts = await Contact.find(
			{ receiver: req.params.userId, accepted: true },
			"sender interactions"
		).populate("sender", "_id name img createdAt experience education skills");

		let contacts = [].concat(sentContacts).concat(receivedContacts);

		// Sort contacts descending by number of interactions
		contacts.sort((a, b) => {
			return (a.interactions < b.interactions ? 1 : (a.interactions > b.interactions ? -1 : 0));
		})

		// Send user info cleanly
		let usersOnly = contacts.map(contact => {
			// return the defined field
			return (contact.sender ? contact.sender : contact.receiver);
		});

		res.status(200).json(usersOnly);
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αναζήτηση επαφών: " + err });
	}
}

exports.deleteContact = async (req, res) => {
	try {
		if (req.params.userId !== req.userId)
			return res.status(403).json({ error: "Δεν έχετε την άδεια για απόρριψη αιτημάτων σύνδεσης του χρήστη" });

		// Can only reject requests sent to us
		await Contact.deleteOne({ _id: req.params.requestId, receiver: req.params.userId });

		res.status(204).json({ message: "Απόρριψη αιτήματος σύνδεσης" });
	} catch(err) {
		res.status(500).json({ error: "Απέτυχε η απόρριψη αιτημάτος σύνδεσης: " + err });
	}
}


exports.export = async (req, res) => {
	const type = req.query.type || "xml";

	console.log(type);
	// TODO export users that were requested, XML/JSON
};
