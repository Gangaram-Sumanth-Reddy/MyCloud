const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { connectToDatabase } = require('./setup/db');
const { getEnv } = require('./setup/env');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const folderRoutes = require('./routes/folderRoutes');

const app = express();
const env = getEnv();

// Ensure upload directory exists for local storage
if (env.STORAGE_DRIVER === 'local') {
	const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}
}

// Middleware
const corsOptions = {
	origin: (origin, callback) => {
		if (!origin) return callback(null, true);
		if (origin.startsWith('http://localhost')) return callback(null, true);
		if (origin === env.CLIENT_ORIGIN) return callback(null, true);
		return callback(new Error('Not allowed by CORS'));
	},
	credentials: true,
};
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get('/api/health', (_req, res) => {
	return res.json({ status: 'ok' });
});

// Serve uploaded files if local storage is used
if (env.STORAGE_DRIVER === 'local') {
	app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/folders', folderRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
	console.error(err);
	const status = err.status || 500;
	return res.status(status).json({ message: err.message || 'Server error' });
});

// Start server
const start = async () => {
	await connectToDatabase(env.MONGODB_URI);
	const port = env.PORT || 5000;
	app.listen(port, () => console.log(`✅ API running on port ${port}`));
};

start();
