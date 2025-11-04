const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { validationResult } = require('express-validator');
const { getEnv } = require('../setup/env');
const FileModel = require('../models/File');
const User = require('../models/User');

const DEFAULT_STORAGE_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB

async function listFiles(req, res) {
	const { search = '', folder = undefined, page = 1, limit = 50 } = req.query;
	const query = { userId: req.user.id };
	if (folder) query.folder = folder;
	if (search) query.originalName = { $regex: escapeRegex(search), $options: 'i' };
	const skip = (Number(page) - 1) * Number(limit);
	const [items, total, usageDoc] = await Promise.all([
		FileModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
		FileModel.countDocuments(query),
		User.findById(req.user.id).select('usedStorageBytes storageLimitBytes'),
	]);
	const usage = usageDoc
		? {
			usedStorageBytes: usageDoc.usedStorageBytes || 0,
			storageLimitBytes: Math.max(usageDoc.storageLimitBytes || 0, DEFAULT_STORAGE_LIMIT),
		}
		: { usedStorageBytes: 0, storageLimitBytes: DEFAULT_STORAGE_LIMIT };
	return res.json({ items, total, page: Number(page), limit: Number(limit), usage });
}

async function uploadFile(req, res) {
	const env = getEnv();
	// multer populates req.file
	if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
	const { originalname, filename, mimetype, size } = req.file;
	const folder = (req.body.folder || 'root').trim() || 'root';
	const fileDoc = await FileModel.create({
		userId: req.user.id,
		originalName: originalname,
		storedName: filename,
		sizeBytes: size,
		mimeType: mimetype,
		folder,
		storageDriver: env.STORAGE_DRIVER,
		path: env.STORAGE_DRIVER === 'local' ? path.join(env.UPLOAD_DIR, filename) : undefined,
	});
	await User.findByIdAndUpdate(req.user.id, { $inc: { usedStorageBytes: size } });
	return res.status(201).json(fileDoc);
}

async function downloadFile(req, res) {
	const env = getEnv();
	const file = await FileModel.findOne({ _id: req.params.id, userId: req.user.id });
	if (!file) return res.status(404).json({ message: 'File not found' });
	if (file.storageDriver === 'local') {
		const abs = path.resolve(env.PROJECT_ROOT, file.path);
		res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
		res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
		return fs.createReadStream(abs).pipe(res);
	}
	return res.status(501).json({ message: 'S3 download not implemented in this starter' });
}

async function previewFile(req, res) {
	const env = getEnv();
	const file = await FileModel.findOne({ _id: req.params.id, userId: req.user.id });
	if (!file) return res.status(404).json({ message: 'File not found' });
	if (file.storageDriver === 'local') {
		const abs = path.resolve(env.PROJECT_ROOT, file.path);
		res.setHeader('Content-Type', file.mimeType || mime.lookup(file.originalName) || 'application/octet-stream');
		res.setHeader('Content-Disposition', 'inline');
		return fs.createReadStream(abs).pipe(res);
	}
	return res.status(501).json({ message: 'S3 preview not implemented in this starter' });
}

async function deleteFile(req, res) {
	const env = getEnv();
	const file = await FileModel.findOne({ _id: req.params.id, userId: req.user.id });
	if (!file) return res.status(404).json({ message: 'File not found' });
	if (file.storageDriver === 'local' && file.path) {
		const abs = path.resolve(env.PROJECT_ROOT, file.path);
		if (fs.existsSync(abs)) fs.unlinkSync(abs);
	}
	await FileModel.deleteOne({ _id: file._id });
	await User.findByIdAndUpdate(req.user.id, { $inc: { usedStorageBytes: -file.sizeBytes } });
	return res.json({ success: true });
}

async function renameFile(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { name } = req.body;
	const file = await FileModel.findOne({ _id: req.params.id, userId: req.user.id });
	if (!file) return res.status(404).json({ message: 'File not found' });
	// Preserve extension if user didn't include one
	const ext = path.extname(file.originalName);
	const newName = path.extname(name) ? name : `${name}${ext}`;
	file.originalName = newName;
	await file.save();
	return res.json(file);
}

function escapeRegex(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { listFiles, uploadFile, downloadFile, previewFile, deleteFile, renameFile };


