const { Contact } = require("../models/user.model");

module.exports = async (req, res, next) => {
	try {
		await Contact.updateOne(
			{
				$or: [
					{ sender: req.userId, receiver: req.partnerId },
					{ sender: req.partnerId, receiver: req.UserId },
				],
			},
			{ $inc: { interactions: 1 } }
		);
	} catch (err) {
		console.log("No contact, cannot update interactions");
	}

	next();
};
