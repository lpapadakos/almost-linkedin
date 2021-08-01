const Article = require("../models/article.model");
const Contact = require("../models/contact.model");

exports.getArticleById = async (req, res) => {
	try {
		article = await Article.findById(req.params.id);

		if (article)
			res.status(200).json(article);
		else
			res.status(404).json({ error: "Δεν βρέθηκε το άρθρο" });
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αναζήτηση άρθρων: " + err });
	}
}

exports.getUserArticles = async (req, res) => {
	try {
		res.status(200).json(await Article.find({ posterId: req.query.from }));
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αναζήτηση άρθρων: " + err });
	}
}

exports.getArticles = async (req, res) => {
	try {
		const sentContacts = await Contact.find({ senderId: req.userId, accepted: true }, 'receiverId -_id');
		const receivedContacts = await Contact.find({ receiverId: req.userId, accepted: true }, 'senderId -_id');

		// Articles posted by the user...
		let authors = [req.userId];

		// ...or their contacts
		if (sentContacts) {
			authors = authors.concat(sentContacts.map(contact => {
				return contact.receiverId;
			}));
		}

		if (receivedContacts) {
			authors = authors.concat(receivedContacts.map(contact => {
				return contact.senderId;
			}));
		}

		const articles = await Article.find({ $or: [
			{ posterId: { $in: authors } },
			{ interestNotes: { $in: authors } }
		]});

		res.status(200).json(articles);
	} catch (err) {
		res.status(500).json({ error: "Απέτυχε η αναζήτηση άρθρων: " + err });
	}
}
