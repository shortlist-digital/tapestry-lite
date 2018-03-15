const createWebpackCompiler = require('../src/config/createWebpackCompiler')

console.log('Starting server')

const serverCompiler = createWebpackCompiler('node')

serverCompiler.watch({ quiet: false }, () => {})
