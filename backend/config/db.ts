import mongoose from "mongoose";

let cached = global as any;

if (!cached.connection) {
  cached.connection = { conn: null, promise: null };
}

const normalizeUri = (uri?: string) => {
  if (!uri) return undefined;
  return uri.replace(/^"|"$/g, "");
};

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

const PRIMARY_URI = normalizeUri(process.env.MONGODB_URI) || "mongodb://127.0.0.1:27017/scholarshine-connect";
const FALLBACK_URI = normalizeUri(process.env.MONGODB_FALLBACK_URI) || "mongodb://127.0.0.1:27017/scholarshine-connect";

const connectWithUri = async (uri: string) => {
  return mongoose.connect(uri);
};

export async function connectDB() {
  if (cached.connection.conn) {
    console.log("✓ MongoDB already connected");
    return cached.connection.conn;
  }

  if (!cached.connection.promise) {
    cached.connection.promise = connectWithUri(PRIMARY_URI)
      .then((mongoose) => {
        console.log(`✓ MongoDB connected successfully to ${PRIMARY_URI}`);
        return mongoose;
      })
      .catch(async (primaryError: unknown) => {
        console.warn(`⚠️ Primary MongoDB connection failed: ${getErrorMessage(primaryError)}`);
        // Try fallback URI if configured
        try {
          if (PRIMARY_URI !== FALLBACK_URI) {
            console.warn(`⚠️ Trying fallback MongoDB URI: ${FALLBACK_URI}`);
            const m = await connectWithUri(FALLBACK_URI);
            console.log(`✓ MongoDB connected successfully to fallback ${FALLBACK_URI}`);
            return m;
          }
        } catch (fallbackError: unknown) {
          console.warn(`⚠️ Fallback MongoDB connection failed: ${getErrorMessage(fallbackError)}`);
        }

        // As a last resort, attempt to start an in-memory MongoDB server (dev only)
        // This requires the `mongodb-memory-server` package to be installed in devDependencies.
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { MongoMemoryServer } = require("mongodb-memory-server");
          console.warn("⚠️ Starting in-memory MongoDB for development (mongodb-memory-server)...");
          const mongod = await MongoMemoryServer.create({ instance: { dbName: "scholarshine-connect" } });
          const uri = mongod.getUri();
          const m = await connectWithUri(uri);
          console.log(`✓ MongoDB connected to in-memory server: ${uri}`);
          // store the mongod instance so it doesn't get GC'd
          cached._mongod = mongod;
          return m;
        } catch (memErr: unknown) {
          console.error("✗ In-memory MongoDB fallback failed or package missing:", getErrorMessage(memErr));
        }

        throw primaryError;
      });
  }

  cached.connection.conn = await cached.connection.promise;
  return cached.connection.conn;
}

export default connectDB;
