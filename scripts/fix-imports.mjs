import fs from 'fs'
import path from 'path'

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f)
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (/\.(tsx?|jsx?)$/.test(f)) {
      let c = fs.readFileSync(p, 'utf8')
      if (c.includes('@/pages/')) {
        c = c.split('@/pages/').join('@/views/')
        fs.writeFileSync(p, c)
        console.log('updated', p)
      }
    }
  }
}

walk('src/app')
