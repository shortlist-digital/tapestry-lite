const createWebpackCompiler = require('../src/config/createWebpackCompiler')

console.log('Building server')

const serverCompiler = createWebpackCompiler({ env: 'node', args: process.argv.slice(2) })

serverCompiler.run(() => {
  console.log('Built server')
  process.exit(0)
})
