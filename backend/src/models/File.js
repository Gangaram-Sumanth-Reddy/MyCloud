const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
		originalName: { type: String, required: true, index: true },
		storedName: { type: String, required: true, unique: true },
		sizeBytes: { type: Number, required: true },
		mimeType: { type: String, required: true },
		folder: { type: String, default: 'root', index: true },
		storageDriver: { type: String, enum: ['local', 's3'], default: 'local' },
		s3Key: { type: String },
		path: { type: String },
	},
	{ timestamps: true }
);

const FileModel = mongoose.model('File', FileSchema);
module.exports = FileModel;


