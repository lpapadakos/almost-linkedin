const JobAd = require("../models/job-ad.model");

exports.post = async (req, res, next) => {
	try {
		const jobAd = await JobAd.create({
			poster: req.userId,
			where: req.body.where,
			what: req.body.what,
			description: req.body.description,
		});

		res.status(201).json(jobAd);
	} catch (err) {
		next(err);
	}
};

exports.get = async (req, res, next) => {
	try {
		let filter = {};

		if (req.params.jobAdId) {
			filter._id = req.params.jobAdId;
		} else if (req.query.from) {
			filter.poster = req.query.from;
		}

		const articles = await Article.find(filter)
			.sort({ updatedAt: "desc" })
			.sort({ "comments.createdAt": "asc" })
			.populate("poster", "_id name img")
			.populate("interestNotes", "_id name img")
			.populate("comments.poster", "_id name img");

		if (req.params.jobAdId) {
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
		let article = await Article.findById(req.params.articleId);

		if (article) {
			// Can only delete own articles
			if (article.poster.equals(req.userId)) {
				return res
					.status(403)
					.json({ error: "Λειτουργία διαθέσιμη μόνο για τον συγγραφέα του άρθρου" });
			}

			await Promise.all(
				article.media.map(async (file) => fs.promises.unlink("./uploads/" + file.id))
			);
			await article.delete();
		}

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
