const webpack = require('webpack')
const createWebpackConfig = require('./createWebpackConfig')

module.exports = config => {
  let compiler
  try {
    compiler = webpack(createWebpackConfig('node', config))
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
  return compiler
}
