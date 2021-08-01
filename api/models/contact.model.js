const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({
	senderId: { type: mongoose.Types.ObjectId, ref: 'User' },
	receiverId: { type: mongoose.Types.ObjectId, ref: 'User' },
	accepted: { type: Boolean, default: false },
	interactions: { type: Number, default: 0 }
});

module.exports = mongoose.model("Contact", contactSchema);
