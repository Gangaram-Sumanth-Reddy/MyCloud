const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
		name: { type: String, required: true },
		parent: { type: String, default: 'root' },
	},
	{ timestamps: true }
);

FolderSchema.index({ userId: 1, name: 1, parent: 1 }, { unique: true });

const Folder = mongoose.model('Folder', FolderSchema);
module.exports = Folder;


