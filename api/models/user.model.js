const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');

const entrySchema = mongoose.Schema({
	where: String,
	what: String,
	fromYear: Number,
	toYear: Number
});

const userSchema = mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	phone: String,
	img: {
		data: Buffer,
		contentType: String
	},
	role: { type: String, enum: ['user', 'admin'], default: 'user' },
	joinDate: { type: Date, default: Date.now },
	experience: {
		private: { type: Boolean, default: false },
		entries: [entrySchema]
	},
	education: {
		private: { type: Boolean, default: false },
		entries: [entrySchema]
	},
	skills: {
		private: { type: Boolean, default: false },
		entries: [String]
	}
});

userSchema.plugin(uniqueValidator, { message: "Ο χρήστης με αυτό το email υπάρχει ήδη" } );

module.exports = mongoose.model("User", userSchema);
