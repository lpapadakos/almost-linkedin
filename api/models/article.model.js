const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
	{
		poster: { type: mongoose.Types.ObjectId, ref: "User" },
		text: String,
	},
	{ timestamps: true }
);

const articleSchema = mongoose.Schema(
	{
		poster: { type: mongoose.Types.ObjectId, ref: "User" },
		text: String,
		media: [
			{
				id: { type: String },
				type: { type: String },
			},
		],
		interestNotes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
		comments: [commentSchema],
	},
	{ timestamps: true }
);

module.exports = {
	Comment: mongoose.model("Comment", commentSchema),
	Article: mongoose.model("Article", articleSchema),
};
