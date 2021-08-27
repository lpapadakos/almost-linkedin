const fs = require("fs");

const { Article, Comment } = require("../models/article.model");
const { Contact } = require("../models/user.model");

exports.post = async (req, res, next) => {
	try {
		// role is not defined during registration. It's 'user'. Admin is preinstalled
		let article = new Article({
			poster: req.userId,
			text: req.body.text,
		});

		// Save ids of any uploaded media (photos, e.t.c.)
		article.media = req.files.map((file) => {
			return {
				id: file.filename,
				type: file.mimetype,
			};
		});

		await article.save();
		res.status(201).json(article);
	} catch (err) {
		next(err);
	}
};

exports.get = async (req, res, next) => {
	try {
		let filter = {};

		if (req.params.articleId) {
			filter._id = req.params.articleId;
		} else if (req.query.from) {
			filter.poster = req.query.from;
		} else {
			const sentContacts = await Contact.find({ sender: req.userId, accepted: true }, "receiver -_id");
			const receivedContacts = await Contact.find({ receiver: req.userId, accepted: true }, "sender -_id");

			// Articles posted by the user...
			let authors = [req.userId];

			// ...or their contacts
			if (sentContacts) {
				authors = authors.concat(
					sentContacts.map((contact) => {
						return contact.receiver;
					})
				);
			}

			if (receivedContacts) {
				authors = authors.concat(
					receivedContacts.map((contact) => {
						return contact.sender;
					})
				);
			}

			filter = {
				$or: [{ poster: { $in: authors } }, { interestNotes: { $in: authors } }],
			};
		}

		const articles = await Article.find(filter)
			.sort({ updatedAt: "desc" })
			.sort({ "comments.createdAt": "asc" })
			.populate("poster", "_id name img")
			.populate("interestNotes", "_id name img")
			.populate("comments.poster", "_id name img");

		if (req.params.articleId) {
			if (articles) {
				return res.status(200).json(articles[0]);
			} else {
				return res.status(404).json({
					error: "Δεν βρέθηκε το άρθρο",
				});
			}
		}

		res.status(200).json(articles);
	} catch (err) {
		next(err);
	}
};

exports.delete = async (req, res, next) => {
	try {
		// Can only delete own articles
		let article = await Article.findOneAndDelete({
			_id: req.params.articleId,
			poster: req.userId,
		});

		if (article) await article.media.forEach((file) => fs.unlinkSync("./uploads/" + file.id));

		res.status(204).json({ message: "Το άρθρο διεγράφη" });
	} catch (err) {
		next(err);
	}
};

exports.like = async (req, res, next) => {
	try {
		const article = await Article.findByIdAndUpdate(req.params.articleId, {
			$addToSet: { interestNotes: req.userId },
		});

		res.status(201).json({
			message: "Δηλώθηκε ενδιαφέρον για το άρθρο",
		});

		// For interaction
		req.partnerId = article.poster;
		next();
	} catch (err) {
		next(err);
	}
};

exports.unlike = async (req, res, next) => {
	try {
		await Article.updateOne({ _id: req.params.articleId }, { $pull: { interestNotes: req.userId } });
		res.status(204).json({
			message: "Αφαιρέθηκε η δήλωση ενδιαφέροντος για το άρθρο",
		});
	} catch (err) {
		next(err);
	}
};

exports.comment = async (req, res, next) => {
	try {
		const comment = new Comment({
			poster: req.userId,
			text: req.body.text,
		});
		const article = await Article.findByIdAndUpdate(req.params.articleId, { $push: { comments: comment } }, { new: true });

		res.status(201).json(article.comments.pop());

		// For interaction
		req.partnerId = article.poster;
		next();
	} catch (err) {
		next(err);
	}
};

exports.deleteComment = async (req, res, next) => {
	try {
		// Can only delete own comments
		await Article.updateOne(
			{ _id: req.params.articleId },
			{
				$pull: {
					comments: {
						_id: req.params.commentId,
						poster: req.userId,
					},
				},
			}
		);
		res.status(204).json({
			message: "Αφαιρέθηκε το σχόλιο από το άρθρο",
		});
	} catch (err) {
		next(err);
	}
};
