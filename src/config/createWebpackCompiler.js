const webpack = require('webpack')
const createWebpackConfig = require('./createWebpackConfig')

module.exports = target => {
  let compiler
  try {
    compiler = webpack(createWebpackConfig(target))
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
  return compiler
}
