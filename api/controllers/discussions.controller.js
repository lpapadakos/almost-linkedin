const Message = require("../models/message.model");
const { Contact } = require("../models/user.model");

exports.summary = async (req, res, next) => {
	try {
		// TODO provide last sent message as well?
		let discussions = await Message.aggregate([{ $match: { receiver: req.userId } }, { $group: { _id: "$sender" } }]);
		await Message.populate(discussions, { path: "_id", select: "_id name img" });

		// We only want the users we've communicated with, in the summary
		res.status(200).json(discussions.map((message) => message._id));
	} catch (err) {
		next(err);
	}
};

exports.sendMessage = async (req, res, next) => {
	try {
		if (req.params.userId === req.userId) {
			return res.status(400).json({ error: "Δεν μπορεί να γίνει συζήτηση με τον ίδιο το χρήστη" });
		}

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

		if (!isContact) return res.status(403).json({ error: "Δεν έχετε την άδεια συζήτησης με το χρήστη" });

		const message = await Message.create({
			sender: req.userId,
			receiver: req.params.userId,
			text: req.body.text,
		});

		res.status(201).json(message);

		// For interaction
		req.partnerId = req.params.userId;
		next();
	} catch (err) {
		next(err);
	}
};

exports.get = async (req, res, next) => {
	try {
		let messages = await Message.find({
			$or: [
				{ sender: req.userId, receiver: req.params.userId },
				{ sender: req.params.userId, receiver: req.userId },
			],
		}).sort({ createdAt: "asc" });

		res.status(200).json(messages);
	} catch (err) {
		next(err);
	}
};
