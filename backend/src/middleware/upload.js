const path = require('path');
const multer = require('multer');
const { randomUUID } = require('crypto');
const { getEnv } = require('../setup/env');

const env = getEnv();

if (env.STORAGE_DRIVER !== 'local') {
	// For brevity we implement local storage by default. S3 handled in controllers if needed.
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, env.UPLOAD_ABS);
	},
	filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
	},
});

const upload = multer({ storage });

module.exports = { upload };


