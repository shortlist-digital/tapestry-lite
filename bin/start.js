const webpack = require('webpack')
const devServer = require('webpack-dev-server')
const createWebpackConfig = require('../src/config/createWebpackConfig')

const serverConfig = createWebpackConfig('node')
const serverCompiler = webpack(serverConfig)

const clientConfig = createWebpackConfig('web')
const clientCompiler = webpack(clientConfig)
const clientDevServer = new devServer(clientCompiler, clientConfig.devServer)

console.log('Starting server')

serverCompiler.watch({ quiet: false }, () => {})
clientDevServer.listen(4001, err => console.error(err))
