const mongoose = require('mongoose');

async function connectToDatabase(mongoUri) {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

module.exports = { connectToDatabase };
