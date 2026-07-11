import dns from 'node:dns'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

/** Atlas SRV+TXT DNS often fails on Windows; resolve SRV with public DNS and use a standard URI. */
async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith('mongodb+srv://')) return uri

  const withoutScheme = uri.slice('mongodb+srv://'.length)
  const at = withoutScheme.indexOf('@')
  const slash = withoutScheme.indexOf('/', at)
  if (at === -1 || slash === -1) return uri

  const creds = withoutScheme.slice(0, at)
  const host = withoutScheme.slice(at + 1, slash)
  const rest = withoutScheme.slice(slash + 1)
  const db = rest.split('?')[0]
  const extraParams = rest.includes('?') ? rest.slice(rest.indexOf('?') + 1) : ''

  dns.setServers(['8.8.8.8', '1.1.1.1'])
  const records = await dns.promises.resolveSrv(`_mongodb._tcp.${host}`)
  const hosts = records.map((r) => `${r.name}:${r.port}`).join(',')
  const params = new URLSearchParams(extraParams)
  if (!params.has('ssl')) params.set('ssl', 'true')
  if (!params.has('authSource')) params.set('authSource', 'admin')
  const qs = params.toString()

  return `mongodb://${creds}@${hosts}/${db}${qs ? `?${qs}` : ''}`
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null }
global.mongooseCache = cached

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined')
  }

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = (async () => {
      const uri = await resolveMongoUri(MONGODB_URI)
      return mongoose.connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 15000,
      })
    })()
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    throw error
  }

  return cached.conn
}
