const jobAdSchema = mongoose.Schema(
	{
		poster: { type: mongoose.Types.ObjectId, ref: "User" },
		where: String,
		what: String,
		description: String,
		applications: [{ type: mongoose.Types.ObjectId, ref: "User" }],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("JobAd", jobAdSchema);
