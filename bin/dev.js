const webpack = require('webpack')
const devServer = require('webpack-dev-server')
const createWebpackConfig = require('../src/config/createWebpackConfig')

const serverConfig = createWebpackConfig('node')
const serverCompiler = webpack(serverConfig)

const clientConfig = createWebpackConfig('web')
const clientCompiler = webpack(clientConfig)
const clientDevServer = new devServer(clientCompiler, clientConfig.devServer)

console.log('\nCreating Tapestry Lite development compilers\n')

serverCompiler.watch({ quiet: false }, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(err || stats.hasErrors())
  }
})

clientDevServer.listen(4001, err => console.error(err))
