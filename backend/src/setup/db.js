const mongoose = require('mongoose');

async function connectToDatabase(mongoUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ MongoDB connected successfully');
}

module.exports = { connectToDatabase };
