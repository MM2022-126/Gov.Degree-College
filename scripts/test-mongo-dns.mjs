import dns from 'node:dns'
import mongoose from 'mongoose'

dns.setServers(['8.8.8.8', '1.1.1.1'])

const srv = process.env.MONGODB_URI
if (!srv?.startsWith('mongodb+srv://')) {
  console.error('MONGODB_URI must be mongodb+srv://')
  process.exit(1)
}

const withoutScheme = srv.slice('mongodb+srv://'.length)
const at = withoutScheme.indexOf('@')
const slash = withoutScheme.indexOf('/', at)
const creds = withoutScheme.slice(0, at)
const host = withoutScheme.slice(at + 1, slash)
const rest = withoutScheme.slice(slash + 1)
const db = rest.split('?')[0]

const records = await dns.promises.resolveSrv(`_mongodb._tcp.${host}`)
const hosts = records.map((r) => `${r.name}:${r.port}`).join(',')
const uri = `mongodb://${creds}@${hosts}/${db}?ssl=true&authSource=admin`

console.log('Resolved', records.length, 'hosts from SRV')
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 })
  console.log('MONGO OK (standard URI from SRV)')
  await mongoose.disconnect()
} catch (e) {
  console.error('MONGO FAIL', e.message)
  process.exit(1)
}
