const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { getEnv } = require('../setup/env');

const DEFAULT_STORAGE_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB

async function signup(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { name, email, password } = req.body;
	const existing = await User.findOne({ email });
	if (existing) return res.status(409).json({ message: 'Email already registered' });
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await User.create({ name, email, passwordHash });
	const token = signToken(user._id);
	return res.status(201).json({ token, user: publicUser(user) });
}

async function login(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if (!user) return res.status(401).json({ message: 'Invalid credentials' });
	const valid = await user.comparePassword(password);
	if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
	const token = signToken(user._id);
	return res.json({ token, user: publicUser(user) });
}

async function me(req, res) {
	const user = await User.findById(req.user.id);
	if (!user) return res.status(404).json({ message: 'User not found' });
	return res.json({ user: publicUser(user) });
}

function signToken(userId) {
	const env = getEnv();
	return jwt.sign({}, env.JWT_SECRET, { subject: String(userId), expiresIn: '7d' });
}

function publicUser(user) {
	return {
		id: String(user._id),
		name: user.name,
		email: user.email,
		storageLimitBytes: Math.max(user.storageLimitBytes || 0, DEFAULT_STORAGE_LIMIT),
		usedStorageBytes: user.usedStorageBytes,
		createdAt: user.createdAt,
	};
}

module.exports = { signup, login, me };


