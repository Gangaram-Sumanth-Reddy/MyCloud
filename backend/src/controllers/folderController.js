const { validationResult } = require('express-validator');
const Folder = require('../models/Folder');
const FileModel = require('../models/File');

async function listFolders(req, res) {
	const folders = await Folder.find({ userId: req.user.id }).sort({ createdAt: -1 });
	return res.json({ items: folders });
}

async function createFolder(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { name, parent = 'root' } = req.body;
	const trimmed = name.trim();
	if (!trimmed) return res.status(400).json({ message: 'Folder name required' });
	const existing = await Folder.findOne({ userId: req.user.id, name: trimmed, parent });
	if (existing) return res.status(409).json({ message: 'Folder name already exists' });
	const folder = await Folder.create({ userId: req.user.id, name: trimmed, parent });
	return res.status(201).json(folder);
}

async function deleteFolder(req, res) {
	const { id } = req.params;
	const folder = await Folder.findOne({ _id: id, userId: req.user.id });
	if (!folder) return res.status(404).json({ message: 'Folder not found' });
	const hasFiles = await FileModel.exists({ userId: req.user.id, folder: folder.name });
	if (hasFiles) return res.status(400).json({ message: 'Folder not empty' });
	await Folder.deleteOne({ _id: folder._id });
	return res.json({ success: true });
}

async function renameFolder(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { id } = req.params;
	const { name } = req.body;
	const trimmed = name.trim();
	if (!trimmed) return res.status(400).json({ message: 'Folder name required' });
	const folder = await Folder.findOne({ _id: id, userId: req.user.id });
	if (!folder) return res.status(404).json({ message: 'Folder not found' });
	const duplicate = await Folder.findOne({ userId: req.user.id, name: trimmed, parent: folder.parent, _id: { $ne: folder._id } });
	if (duplicate) return res.status(409).json({ message: 'Folder name already exists' });
	const previousName = folder.name;
	folder.name = trimmed;
	await folder.save();
	await FileModel.updateMany({ userId: req.user.id, folder: previousName }, { $set: { folder: trimmed } });
	return res.json(folder);
}

module.exports = { listFolders, createFolder, deleteFolder, renameFolder };


