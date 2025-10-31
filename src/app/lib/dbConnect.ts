import mongoose from "mongoose";

type MongooseConnection = typeof mongoose;

declare global {
  var mongoose: {
    conn: MongooseConnection | null;
    promise: Promise<MongooseConnection> | null;
  };
}

// Initialize global mongoose object if not already done
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
async function dbConnect(): Promise<MongooseConnection> {
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }

  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    global.mongoose.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log("✅ MongoDB connected successfully");
      return mongooseInstance;
    }) as Promise<MongooseConnection>;
  }

  try {
    global.mongoose.conn = await global.mongoose.promise;
  } catch (e) {
    global.mongoose.promise = null;
    throw e;
  }

  return global.mongoose.conn;
}

export default dbConnect;


