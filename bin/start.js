const createWebpackCompiler = require('../src/config/createWebpackCompiler')

console.log('Starting server')

const serverCompiler = createWebpackCompiler({ env: 'node', args: process.argv.slice(2) })

serverCompiler.watch({ quiet: false }, () => {})
