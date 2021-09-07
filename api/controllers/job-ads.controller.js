const JobAd = require("../models/job-ad.model");
const { User } = require("../models/user.model");

exports.post = async (req, res, next) => {
	try {
		const jobAd = await JobAd.create({
			poster: req.userId,
			what: req.body.what,
			where: req.body.where,
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

		let jobAds = await JobAd.find(filter)
			.populate("poster", "_id name img")
			.populate("applications", "_id name img")
			.lean();

		const user = await User.findById(req.userId);

		// TODO sort job ads by relevance to user skills

		if (req.params.jobAdId) {
			if (jobAds) {
				return res.status(200).json(jobAds[0]);
			} else {
				return res.status(404).json({ error: "Δεν βρέθηκε η αγγελία" });
			}
		}

		res.status(200).json(jobAds);
	} catch (err) {
		next(err);
	}
};

exports.delete = async (req, res, next) => {
	try {
		let jobAd = await JobAd.findById(req.params.jobAdId);

		if (jobAd) {
			// Can only delete own job ads
			if (!jobAd.poster.equals(req.userId)) {
				return res
					.status(403)
					.json({ error: "Λειτουργία διαθέσιμη μόνο για τον συγγραφέα της αγγελίας" });
			}

			await jobAd.delete();
		}

		res.status(204).json({ message: "Η αγγελία διεγράφη" });
	} catch (err) {
		next(err);
	}
};

exports.apply = async (req, res, next) => {
	try {
		const jobAd = await JobAd.findByIdAndUpdate(req.params.jobAdId, {
			$addToSet: { applications: req.userId },
		});

		res.status(201).json({ message: "Έγινε αίτηση για τη θέση εργασίας" });

		// For interaction
		req.partnerId = jobAd.poster;
		next();
	} catch (err) {
		next(err);
	}
};

exports.cancelApply = async (req, res, next) => {
	try {
		await JobAd.updateOne({ _id: req.params.jobAdId }, { $pull: { applications: req.userId } });
		res.status(204).json({ message: "Αφαιρέθηκε η αίτηση για τη θέση εργασίας" });
	} catch (err) {
		next(err);
	}
};
