const webpack = require('webpack')
const devServer = require('webpack-dev-server')
const createWebpackConfig = require('../src/config/createWebpackConfig')

const config  = createWebpackConfig('web')
const compiler = webpack(config)
const clientDevServer = new devServer(compiler, config.devServer)
clientDevServer.listen(4001, (err) => { console.error(err) })

