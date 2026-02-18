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
	
	// Check user storage quota
	const user = await User.findById(req.user.id);
	const storageLimit = Math.max(user.storageLimitBytes || 0, DEFAULT_STORAGE_LIMIT);
	const usedStorage = user.usedStorageBytes || 0;
	
	if (usedStorage + size > storageLimit) {
		// Delete uploaded file if quota exceeded
		if (env.STORAGE_DRIVER === 'local') {
			const uploadPath = path.resolve(env.PROJECT_ROOT, env.UPLOAD_DIR, filename);
			if (fs.existsSync(uploadPath)) {
				fs.unlinkSync(uploadPath);
			}
		}
		return res.status(413).json({ message: 'Storage quota exceeded' });
	}
	
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
		if (!fs.existsSync(abs)) {
			return res.status(404).json({ message: 'File not found on disk' });
		}
		res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
		res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
		const stream = fs.createReadStream(abs);
		stream.on('error', (error) => {
			console.error('File stream error:', error);
			if (!res.headersSent) {
				res.status(500).json({ message: 'Error reading file' });
			}
		});
		return stream.pipe(res);
	}
	return res.status(501).json({ message: 'S3 download not implemented in this starter' });
}

async function previewFile(req, res) {
	const env = getEnv();
	const file = await FileModel.findOne({ _id: req.params.id, userId: req.user.id });
	if (!file) return res.status(404).json({ message: 'File not found' });
	if (file.storageDriver === 'local') {
		const abs = path.resolve(env.PROJECT_ROOT, file.path);
		if (!fs.existsSync(abs)) {
			return res.status(404).json({ message: 'File not found on disk' });
		}
		res.setHeader('Content-Type', file.mimeType || mime.lookup(file.originalName) || 'application/octet-stream');
		res.setHeader('Content-Disposition', 'inline');
		const stream = fs.createReadStream(abs);
		stream.on('error', (error) => {
			console.error('File stream error:', error);
			if (!res.headersSent) {
				res.status(500).json({ message: 'Error reading file' });
			}
		});
		return stream.pipe(res);
	}
	return res.status(501).json({ message: 'S3 preview not implemented in this starter' });
}

async function deleteFile(req, res) {
	const env = getEnv();
	const file = await FileModel.findOne({ _id: req.params.id, userId: req.user.id });
	if (!file) return res.status(404).json({ message: 'File not found' });
	if (file.storageDriver === 'local' && file.path) {
		const abs = path.resolve(env.PROJECT_ROOT, file.path);
		try {
			if (fs.existsSync(abs)) {
				fs.unlinkSync(abs);
			}
		} catch (error) {
			console.error('Error deleting file from disk:', error);
			// Continue with database deletion even if file deletion fails
		}
	}
	await FileModel.deleteOne({ _id: file._id });
	await User.findByIdAndUpdate(req.user.id, { $inc: { usedStorageBytes: -file.sizeBytes } });
	return res.json({ success: true });
}

async function renameFile(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { name } = req.body;
	const trimmed = name.trim();
	if (!trimmed) return res.status(400).json({ message: 'File name required' });
	const file = await FileModel.findOne({ _id: req.params.id, userId: req.user.id });
	if (!file) return res.status(404).json({ message: 'File not found' });
	// Preserve extension if user didn't include one
	const ext = path.extname(file.originalName);
	const newName = path.extname(trimmed) ? trimmed : `${trimmed}${ext}`;
	file.originalName = newName;
	await file.save();
	return res.json(file);
}

function escapeRegex(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { listFiles, uploadFile, downloadFile, previewFile, deleteFile, renameFile };


