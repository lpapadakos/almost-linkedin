const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
	sender: { type: mongoose.Types.ObjectId, ref: 'User' },
	receiver: { type: mongoose.Types.ObjectId, ref: 'User' },
	text: String,
	sendDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);
