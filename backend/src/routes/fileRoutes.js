const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
	listFiles,
	uploadFile,
	downloadFile,
	previewFile,
	deleteFile,
	renameFile,
} = require('../controllers/fileController');

const router = express.Router();

router.use(authMiddleware);

router.get('/list', listFiles);
router.post('/upload', upload.single('file'), uploadFile);
router.get('/download/:id', downloadFile);
router.get('/preview/:id', previewFile);
router.delete('/:id', deleteFile);
router.patch('/rename/:id', [body('name').isString().isLength({ min: 1 })], renameFile);

module.exports = router;



