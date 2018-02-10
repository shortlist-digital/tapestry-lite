const webpack = require('webpack')
const createWebpackConfig = require('../config/createWebpackConfig')

function compile(config) {
  let compiler
  try {
    compiler = webpack(config)
  } catch (e) {
    printErrors('Failed to compile.', [e])
    process.exit(1)
  }
  return compiler
}

const serverConfig = createWebpackConfig()

const serverCompiler = compile(serverConfig)
// Start our server webpack instance in watch mode.
console.log('Starting server')

serverCompiler.watch({
    quiet: false
  },
  (stats) => {}
)
