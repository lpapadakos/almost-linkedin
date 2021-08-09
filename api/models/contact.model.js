const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({
	sender: { type: mongoose.Types.ObjectId, ref: 'User' },
	receiver: { type: mongoose.Types.ObjectId, ref: 'User' },
	accepted: { type: Boolean, default: false },
	interactions: { type: Number, default: 0 }
});

module.exports = mongoose.model("Contact", contactSchema);
