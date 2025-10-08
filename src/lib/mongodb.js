import mongoose from 'mongoose';

// Use environment variable if available, otherwise fallback to default
const uri = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster1.pzyia.mongodb.net/test';

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
