const mongoose = require("mongoose");

const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: [ true, "Ο χρήστης υπάρχει ήδη" ] },
	password: { type: String, required: true },
	role: { type: String, default: 'user' },
	phone: String,
	joinDate: { type: Date, default: Date.now }
});

userSchema.plugin(uniqueValidator, );

module.exports = mongoose.model("User", userSchema);
