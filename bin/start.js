const webpack = require('webpack')
const createWebpackConfig = require('../src/config/createWebpackConfig')

function compile(config) {
  let compiler
  try {
    compiler = webpack(config)
  } catch (e) {
    console.error(e)
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
