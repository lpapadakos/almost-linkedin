const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const path = "./uploads";
		fs.mkdirSync(path, { recursive: true });

		return cb(null, path);
	},
});

var upload = multer({ storage: storage });

module.exports = upload;
