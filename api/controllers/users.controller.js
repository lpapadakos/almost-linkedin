const fs = require("fs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const j2xParser = require("fast-xml-parser").j2xParser;

const config = require("../config");
const { Entry, User, Contact } = require("../models/user.model");
const { Article } = require("../models/article.model");
const JobAd = require("../models/job-ad.model");

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
		if (!user) {
			return res.status(401).json({ error: "Λάθος διεύθυνση email ή κωδικός πρόσβασης" });
		}

		const passwordMatch = await bcrypt.compare(req.body.password, user.password);
		if (!passwordMatch) {
			return res.status(401).json({ error: "Λάθος διεύθυνση email ή κωδικός πρόσβασης" });
		}

		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			role: user.role,
			img: user.img,
			bio: user.bio,
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
		// BUG https://github.com/Automattic/mongoose/issues/1399
		const userObjectId = mongoose.Types.ObjectId(req.userId);
		const paramObjectId = mongoose.Types.ObjectId(req.params.userId);

		if (req.params.userId) {
			filter = { _id: paramObjectId };
		} else {
			filter = { role: "user" };
		}

		let users = await User.aggregate([
			{ $match: filter },
			{
				$lookup: {
					// add extra 'contact' field for frontend usage
					from: Contact.collection.name,
					let: { id: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: {
									$or: [
										{
											$and: [
												{
													$eq: [
														"$sender",
														userObjectId,
													],
												},
												{
													$eq: [
														"$receiver",
														"$$id",
													],
												},
											],
										},
										{
											$and: [
												{
													$eq: [
														"$sender",
														"$$id",
													],
												},
												{
													$eq: [
														"$receiver",
														userObjectId,
													],
												},
											],
										},
									],
								},
							},
						},
						{ $project: { accepted: 1 } },
					],
					as: "contact",
				},
			},
			{ $unwind: { path: "$contact", preserveNullAndEmptyArrays: true } },
			{
				$project: {
					name: 1,
					email: 1,
					phone: 1,
					img: 1,
					bio: 1,
					experience: 1,
					education: 1,
					skills: 1,
					createdAt: 1,
					contact: 1,
				},
			},
		]);

		await Promise.all(
			users.map(async (user) => {
				// Keep protected info from public view, with 3 exceptions
				const daijobu =
					req.fromAdmin ||
					user._id.equals(req.userId) ||
					(user.contact && user.contact.accepted);

				for (const entryType of ["experience", "education", "skills"]) {
					if (!user[entryType]) continue;

					if (daijobu || user[entryType].public) {
						if (user[entryType].fromYear) {
							user[entryType].entries.sort(
								(a, b) => b.fromYear - a.fromYear
							);
						}
					} else {
						delete user[entryType].entries;
					}
				}
			})
		);

		if (req.params.userId) {
			if (users && users.length) {
				return res.status(200).json(users[0]);
			} else {
				return res.status(404).json({ error: "Δεν βρέθηκε ο χρήστης" });
			}
		}

		res.status(200).json(users);
	} catch (err) {
		next(err);
	}
};

exports.update = async (req, res, next) => {
	try {
		let user = await User.findById(req.userId);

		const passwordMatch = await bcrypt.compare(req.body.password, user.password);
		if (!passwordMatch) {
			return res.status(403).json({ error: "Λάθος κωδικός πρόσβασης" });
		}

		// Filter to updatable fields
		let update = {
			name: req.body.name,
			email: req.body.email,
			phone: req.body.phone,
			bio: req.body.bio,
		};

		if (req.body.new_password) {
			update.password = await bcrypt.hash(req.body.new_password, 10);
		}

		if (req.file) {
			// Replace avatar img
			try {
				await fs.promises.unlink(config.UPLOAD_DIR + user.img);
			} catch (err) {
				console.error(err);
			}

			update.img = req.file.filename;
		}

		Object.assign(user, update);
		await user.save();

		res.status(200).json(update);
	} catch (err) {
		next(err);
	}
};

exports.addContactRequest = async (req, res, next) => {
	try {
		if (req.params.userId === req.userId) {
			return res
				.status(400)
				.json({ error: "Δεν χρειάζεται να γίνει αίτημα σύνδεσης προς τον ίδιο το χρήστη" });
		}

		const existingRequest = await Contact.exists({
			$or: [
				{ sender: req.userId, receiver: req.params.userId },
				{ sender: req.params.userId, receiver: req.userId },
			],
		});

		if (existingRequest) {
			return res.status(409).json({ error: "Έχει ήδη γίνει αίτημα σύνδεσης" });
		}

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
		res.status(200).json(
			await Contact.find({ receiver: req.params.userId, accepted: false }, "_id sender").populate(
				"sender",
				"_id name img"
			)
		);
	} catch (err) {
		next(err);
	}
};

exports.acceptContactRequest = async (req, res, next) => {
	try {
		let request = await Contact.findById(req.params.requestId);

		if (!request) {
			return res.status(404).json({ error: "Δεν βρέθηκε το αίτημα σύνδεσης" });
		}

		// Can only accept requests sent to us
		if (!request.receiver.equals(req.userId)) {
			return res
				.status(403)
				.json({ error: "Λειτουργία διαθέσιμη μόνο για τον αποδέκτη του αιτήματος" });
		}

		request.accepted = true;
		await request.save();

		res.status(200).json({ message: "Αποδοχή αιτήματος σύνδεσης" });
	} catch (err) {
		next(err);
	}
};

exports.deleteContactRequest = async (req, res, next) => {
	try {
		let request = await Contact.findById(req.params.requestId);

		if (request) {
			// Can only delete requests sent to us or received by us (to end contact)
			if (!request.sender.equals(req.userId) && !request.receiver.equals(req.userId)) {
				return res
					.status(403)
					.json({ error: "Λειτουργία διαθέσιμη μόνο για τα διαπλεκόμενα μέρη" });
			}

			await request.delete();
		}

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

			if (!isContact)
				return res
					.status(403)
					.json({ error: "Δεν έχετε την άδεια για προβολή δικτύου του χρήστη" });
		}

		// BUG https://github.com/Automattic/mongoose/issues/1399
		const paramObjectId = mongoose.Types.ObjectId(req.params.userId);

		const contacts = await Contact.aggregate([
			{
				$match: {
					$or: [
						{ accepted: true, sender: paramObjectId },
						{ accepted: true, receiver: paramObjectId },
					],
				},
			},
			{
				$project: {
					_id: {
						$cond: [{ $eq: ["$receiver", paramObjectId] }, "$sender", "$receiver"],
					},
					interactions: 1,
				},
			},
			{ $sort: { interactions: -1 } },
			{
				$lookup: {
					from: User.collection.name,
					localField: "_id",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },
			{
				$project: {
					name: "$user.name",
					img: "$user.img",
				},
			},
		]);

		res.status(200).json(contacts);
	} catch (err) {
		next(err);
	}
};

exports.addEntry = async (req, res, next) => {
	try {
		const entry = new Entry(req.body);
		await User.updateOne(
			{ _id: req.params.userId },
			{ $push: { [`${req.params.entryType}.entries`]: entry } }
		);

		res.status(201).json(entry);
	} catch (err) {
		next(err);
	}
};

exports.changeEntryStatus = async (req, res, next) => {
	try {
		await User.updateOne(
			{ _id: req.params.userId },
			{ [`${req.params.entryType}.public`]: req.body.public }
		);
		res.status(200).json({ message: "Επιτυχής αλλαγή ιδιωτικότητας δεδομένων προφίλ" });
	} catch (err) {
		next(err);
	}
};

exports.deleteEntry = async (req, res, next) => {
	try {
		await User.updateOne(
			{ _id: req.params.userId },
			{ $pull: { [`${req.params.entryType}.entries`]: { _id: req.params.entryId } } }
		);
		res.status(204).json({ message: "Διαγράφτηκε το δεδομένο προφίλ" });
	} catch (err) {
		next(err);
	}
};

exports.export = async (req, res, next) => {
	try {
		const type = req.query.type || "json";

		// BUG https://github.com/Automattic/mongoose/issues/1399
		const userObjectIds = req.body.map((id) => mongoose.Types.ObjectId(id));

		const users = await User.aggregate([
			// Profile data
			{ $match: { _id: { $in: userObjectIds }, role: "user" } },

			// Network
			{
				$lookup: {
					from: Contact.collection.name,
					let: { id: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$accepted", true] },
										{
											$or: [
												{
													$eq: [
														"$sender",
														"$$id",
													],
												},
												{
													$eq: [
														"$receiver",
														"$$id",
													],
												},
											],
										},
									],
								},
							},
						},
						{
							$project: {
								_id: {
									$cond: [
										{ $eq: ["$receiver", "$$id"] },
										"$sender",
										"$receiver",
									],
								},
							},
						},
					],
					as: "network",
				},
			},

			// Articles (posted, liked, commented)
			{
				$lookup: {
					from: Article.collection.name,
					let: { id: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: {
									$or: [
										{ $eq: ["$$id", "$poster"] },
										{ $in: ["$$id", "$interestNotes"] },
										{ $in: ["$$id", "$comments.poster"] },
									],
								},
							},
						},
						{ $unset: "__v" },
					],
					as: "articles",
				},
			},

			// Job Ads (posted, applied)
			{
				$lookup: {
					from: JobAd.collection.name,
					let: { id: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: {
									$or: [
										{ $eq: ["$$id", "$poster"] },
										{ $in: ["$$id", "$applications"] },
									],
								},
							},
						},
						{ $unset: "__v" },
					],
					as: "job-ads",
				},
			},
			{ $unset: ["password", "__v"] },
		]);

		if (type === "json") {
			res.json(users);
		} else {
			// The stringify-parse loop converts the ObjectIDs to strings
			const xml = new j2xParser().parse(JSON.parse(JSON.stringify({ user: users })));

			res.set("Content-Type", "application/xml");
			res.send(xml);
		}
	} catch (err) {
		next(err);
	}
};
