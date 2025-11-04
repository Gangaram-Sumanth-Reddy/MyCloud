const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		passwordHash: { type: String, required: true },
		storageLimitBytes: { type: Number, default: 2 * 1024 * 1024 * 1024 }, // 2GB
		usedStorageBytes: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

UserSchema.methods.comparePassword = async function comparePassword(password) {
	return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;


