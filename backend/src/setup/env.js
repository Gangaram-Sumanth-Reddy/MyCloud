const path = require('path');

function getEnv() {
    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT ? Number(process.env.PORT) : 5000,
        MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cloud_storage',
        JWT_SECRET: process.env.JWT_SECRET || 'change_this_secret',
        CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
        STORAGE_DRIVER: process.env.STORAGE_DRIVER || 'local',
        UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
        AWS_REGION: process.env.AWS_REGION,
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        PROJECT_ROOT: process.cwd(),
        UPLOAD_ABS: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads')
    };
}

module.exports = { getEnv };
