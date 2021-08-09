const Article = require("../models/article.model");
const Contact = require("../models/contact.model");

exports.postArticle = async (req, res) => {
	try {
		// role is not defined during registration. It's 'user'. Admin is preinstalled
		const article = new Article({
			poster: req.userId,
			text: req.body.text
		});

		// Save ids of any uploaded media (photos, e.t.c.)
		article.media = req.files.map(file => {
			return file.filename;
		});

		await article.save();
		res.status(201).json({ message: "Επιτυχής ανάρτηση άρθρου" });
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η ανάρτηση άρθρου: " + err });
	}
}

exports.getArticleById = async (req, res) => {
	try {
		const article = await Article.findById(req.params.id)
			.populate("poster", "_id name img")
			.populate("interestNotes", "_id name" )
			.populate("comments.poster", "_id name img");

		if (article)
			res.status(200).json(article);
		else
			res.status(404).json({ error: "Δεν βρέθηκε το άρθρο" });
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αναζήτηση άρθρων: " + err });
	}
};

exports.getUserArticles = async (req, res) => {
	try {
		res.status(200).json(await Article.find({ poster: req.query.from })
		.sort({ postDate: "desc" })
			.populate("poster", "_id name img")
			.populate("interestNotes", "_id name" )
			.populate("comments.poster", "_id name img")
		);
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αναζήτηση άρθρων: " + err });
	}
};

exports.getArticles = async (req, res) => {
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
			.populate("poster", "_id name img")
			.populate("interestNotes", "_id name" )
			.populate("comments.poster", "_id name img");

		res.status(200).json(articles);
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αναζήτηση άρθρων: " + err });
	}
};
