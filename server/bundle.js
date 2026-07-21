const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')

// Copy stt.ps1 to dist/ so it's available at runtime
const ps1Src = path.join(__dirname, 'src', 'services', 'stt.ps1')
const ps1Dst = path.join(__dirname, 'dist', 'stt.ps1')
fs.mkdirSync(path.dirname(ps1Dst), { recursive: true })
fs.copyFileSync(ps1Src, ps1Dst)
console.log('  copied stt.ps1 → dist/')

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/index.js',
  external: [],
  format: 'cjs',
  sourcemap: false,
  minify: false,
  logLevel: 'info',
}).catch(() => process.exit(1))
