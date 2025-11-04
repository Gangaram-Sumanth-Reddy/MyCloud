const jwt = require('jsonwebtoken');
const { getEnv } = require('../setup/env');

function authMiddleware(req, res, next) {
	const env = getEnv();
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
	if (!token) return res.status(401).json({ message: 'Unauthorized' });
	try {
		const payload = jwt.verify(token, env.JWT_SECRET);
		req.user = { id: payload.sub };
		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
}

module.exports = { authMiddleware };


