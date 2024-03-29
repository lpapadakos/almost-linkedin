const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const entrySchema = mongoose.Schema({
  what: String,
  where: String,
  fromYear: Number,
  toYear: Number,
});

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    img: { type: String, default: 'default_avatar' },
    bio: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    experience: {
      public: { type: Boolean, default: true },
      entries: [entrySchema],
    },
    education: {
      public: { type: Boolean, default: true },
      entries: [entrySchema],
    },
    skills: {
      public: { type: Boolean, default: true },
      entries: [entrySchema],
    },
    lastDiscussion: { type: mongoose.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator, {
  message: 'Ο χρήστης με αυτό το email υπάρχει ήδη',
});

const contactSchema = mongoose.Schema({
  sender: { type: mongoose.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Types.ObjectId, ref: 'User' },
  accepted: { type: Boolean, default: false },
  interactions: { type: Number, default: 0 },
});

module.exports = {
  Entry: mongoose.model('Entry', entrySchema),
  User: mongoose.model('User', userSchema),
  Contact: mongoose.model('Contact', contactSchema),
};
