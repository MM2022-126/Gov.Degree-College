import fs from 'fs'
import path from 'path'

const srcDir = 'backend/models'
const destDir = 'src/models'
fs.mkdirSync(destDir, { recursive: true })

for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.ts'))) {
  let content = fs.readFileSync(path.join(srcDir, file), 'utf8')
  const match = content.match(/export const (\w+) = mongoose\.model\("(\w+)", (\w+)\)/)
  if (match) {
    const [, , modelName, schemaName] = match
    content = content.replace(/export const \w+ = mongoose\.model\([^)]+\);?\n?/, '')
    content += `\nexport default mongoose.models.${modelName} || mongoose.model('${modelName}', ${schemaName})\n`
  }
  fs.writeFileSync(path.join(destDir, file), content)
}

console.log('Done:', fs.readdirSync(destDir).join(', '))
