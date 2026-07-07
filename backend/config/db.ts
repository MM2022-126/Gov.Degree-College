import mongoose from "mongoose";

let cached = global as any;

if (!cached.connection) {
  cached.connection = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.connection.conn) {
    console.log("✓ MongoDB already connected");
    return cached.connection.conn;
  }

  if (!cached.connection.promise) {
    cached.connection.promise = mongoose.connect(process.env.MONGODB_URI!).then((mongoose) => {
      console.log("✓ MongoDB connected successfully");
      return mongoose;
    });
  }

  cached.connection.conn = await cached.connection.promise;
  return cached.connection.conn;
}

export default connectDB;
