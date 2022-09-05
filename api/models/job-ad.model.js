const mongoose = require('mongoose');

const jobAdSchema = mongoose.Schema(
  {
    poster: { type: mongoose.Types.ObjectId, ref: 'User' },
    what: String,
    where: String,
    description: String,
    applications: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobAd', jobAdSchema, 'job-ads');
