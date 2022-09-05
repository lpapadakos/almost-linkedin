const multer = require('multer');
const fs = require('fs');

const config = require('../config');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = config.UPLOAD_DIR;
    fs.mkdirSync(path, { recursive: true });

    return cb(null, path);
  },
});

var upload = multer({ storage });

module.exports = upload;
