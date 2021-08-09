const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
	poster: { type: mongoose.Types.ObjectId, ref: 'User' },
	text: String,
	postDate: { type: Date, default: Date.now }
});

const articleSchema = mongoose.Schema({
	poster: { type: mongoose.Types.ObjectId, ref: 'User' },
	text: String,
	media: [String], // filenames in uploads/
	postDate: { type: Date, default: Date.now },
	interestNotes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
	comments: [commentSchema]
});

module.exports = mongoose.model("Article", articleSchema);
