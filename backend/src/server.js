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

/* -------------------- ENSURE UPLOAD DIR -------------------- */
if (env.STORAGE_DRIVER === 'local') {
  const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

/* -------------------- CORS (FIXED) -------------------- */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  env.CLIENT_ORIGIN, // Render frontend URL
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('❌ Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));

/* -------------------- MIDDLEWARE -------------------- */
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------- HEALTH CHECK -------------------- */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

/* -------------------- STATIC FILES -------------------- */
if (env.STORAGE_DRIVER === 'local') {
  app.use(
    '/uploads',
    express.static(path.resolve(process.cwd(), env.UPLOAD_DIR))
  );
}

/* -------------------- ROUTES -------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/folders', folderRoutes);

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
});

/* -------------------- START SERVER -------------------- */
const start = async () => {
  try {
    await connectToDatabase(env.MONGODB_URI);
    const port = env.PORT || 5000;
    app.listen(port, () =>
      console.log(`✅ API running on port ${port}`)
    );
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
