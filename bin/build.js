const webpack = require('webpack')
const createWebpackConfig = require('../src/config/createWebpackConfig')

const serverConfig = createWebpackConfig('node')
console.log({serverConfig})
const serverCompiler = webpack(serverConfig)

const clientConfig = createWebpackConfig('web')
const clientCompiler = webpack(clientConfig)

serverCompiler.run(() => {
  clientCompiler.run(() => {
    console.log('Built server')
    process.exit(0)
  })
})
