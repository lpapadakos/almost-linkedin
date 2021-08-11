const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
	poster: { type: mongoose.Types.ObjectId, ref: 'User' },
	text: String,
	postDate: { type: Date, default: Date.now }
});

const articleSchema = mongoose.Schema({
	poster: { type: mongoose.Types.ObjectId, ref: 'User' },
	text: String,
	media: [{
		id: { type: String },
		type: { type: String }
	}],
	postDate: { type: Date, default: Date.now },
	interestNotes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
	comments: [commentSchema]
});

module.exports = {
	Comment: mongoose.model("Comment", commentSchema),
	Article: mongoose.model("Article", articleSchema)
};
