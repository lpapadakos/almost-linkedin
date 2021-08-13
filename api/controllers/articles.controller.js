const { Article, Comment } = require("../models/article.model");
const { Contact } = require("../models/user.model");

exports.post = async (req, res) => {
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
		res.status(500).json({ error: "Απέτυχε η ανάρτηση άρθρου: " + err });
	}
};

exports.getById = async (req, res) => {
	try {
		const article = await Article.findById(req.params.articleId)
			.populate("poster", "_id name img")
			.populate("interestNotes", "_id name")
			.populate("comments.poster", "_id name img");

		if (article) res.status(200).json(article);
		else res.status(404).json({ error: "Δεν βρέθηκε το άρθρο" });
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αναζήτηση άρθρων: " + err });
	}
};

exports.getFromUser = async (req, res) => {
	try {
		res.status(200).json(await Article.find({ poster: req.query.from })
			.sort({ postDate: "desc" })
			.sort({ "comments.postDate": "asc" })
			.populate("poster", "_id name img")
			.populate("interestNotes", "_id name")
			.populate("comments.poster", "_id name img"));
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αναζήτηση άρθρων: " + err });
	}
};

exports.getAll = async (req, res) => {
	try {
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

		const articles = await Article.find({ $or: [{ poster: { $in: authors } }, { interestNotes: { $in: authors } }] })
			.sort({ postDate: "desc" })
			.sort({ "comments.postDate": "asc" })
			.populate("poster", "_id name img")
			.populate("interestNotes", "_id name")
			.populate("comments.poster", "_id name img");

		res.status(200).json(articles);
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αναζήτηση άρθρων: " + err });
	}
};

exports.delete = async (req, res) => {
	try {
		// Can only delete own articles
		await Article.deleteOne({ _id: req.params.articleId, poster: req.userId });
		res.status(204).json({ message: "Το άρθρο διεγράφη" });
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η διαγραφή άρθρου: " + err });
	}
};

increaseInteractionCount = (userId1, userId2) => {
	Contact.findOne({
		$and: [
			{ accepted: true },
			{
				$or: [
 					{ sender: userId1, receiver: userId2 },
					{ sender: userId2, receiver: userId1 },
				],
			},
		]
	}).then(contact => {
		contact.interactions++;
		contact.save();
	}).catch(err => {
		console.log("No contact, cannot update interactions");
	});
}

exports.like = async (req, res) => {
	try {
		const article = await Article.findByIdAndUpdate(req.params.articleId, { $addToSet: { interestNotes: req.userId } });
		await increaseInteractionCount(req.userId, article.poster);

		res.status(201).json({ message: "Δηλώθηκε ενδιαφέρον για το άρθρο" });
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η δήλωση ενδιαφέροντος για το άρθρο: " + err });
	}
};

exports.unlike = async (req, res) => {
	try {
		await Article.updateOne({ _id: req.params.articleId }, { $pull: { interestNotes: req.userId } });
		res.status(204).json({ message: "Αφαιρέθηκε η δήλωση ενδιαφέροντος για το άρθρο" });
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αφαίρεση της δήλωσης ενδιαφέροντος για το άρθρο: " + err });
	}
};

exports.comment = async (req, res) => {
	try {
		const comment = new Comment({ poster: req.userId, text: req.body.text });
		const article = await Article.findByIdAndUpdate(req.params.articleId, { $push: { comments: comment } });

		await increaseInteractionCount(req.userId, article.poster);

		res.status(201).json(comment);
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η προσθήκη σχολίου στο άρθρο: " + err });
	}
};

exports.deleteComment = async (req, res) => {
	try {
		// Can only delete own comments
		await Article.updateOne({ _id: req.params.articleId }, { $pull: { comments: { _id: req.params.commentId, poster: req.userId } } });
		res.status(204).json({ message: "Αφαιρέθηκε το σχόλιο από το άρθρο" });
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αφαίρεση του σχολίου από το άρθρο: " + err });
	}
};
