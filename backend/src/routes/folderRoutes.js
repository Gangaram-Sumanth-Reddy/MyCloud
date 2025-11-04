const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { listFolders, createFolder, deleteFolder, renameFolder } = require('../controllers/folderController');

const router = express.Router();

router.use(authMiddleware);

router.get('/list', listFolders);
router.post('/create', [body('name').isString().isLength({ min: 1 })], createFolder);
router.patch('/:id', [body('name').isString().isLength({ min: 1 })], renameFolder);
router.delete('/:id', deleteFolder);

module.exports = router;



