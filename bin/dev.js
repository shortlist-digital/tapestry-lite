const webpack = require('webpack')
const devServer = require('webpack-dev-server')
const createWebpackConfig = require('../src/config/createWebpackConfig')

const serverConfig = createWebpackConfig('node')
const serverCompiler = webpack(serverConfig)

const clientConfig = createWebpackConfig('web')
const clientCompiler = webpack(clientConfig)
const clientDevServer = new devServer(clientCompiler, clientConfig.devServer)

console.log('Starting compiler for server')

serverCompiler.watch({ quiet: false }, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.log('Server Watch callback called')
    console.error(err || stats.hasErrors())
  }
})

console.log('Starting dev server for client')
clientDevServer.listen(4001, err => console.error(err))
