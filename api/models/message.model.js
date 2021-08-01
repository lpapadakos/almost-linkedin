const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
	senderId: { type: mongoose.Types.ObjectId, ref: 'User' },
	receiverId: { type: mongoose.Types.ObjectId, ref: 'User' },
	text: String,
	sendDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);
