const devServer = require('webpack-dev-server')
const webpack = require('webpack')
const createWebpackConfig = require('../src/config/createWebpackConfig')

const config  = createWebpackConfig('web')
const compiler = webpack(config)
const clientDevServer = devServer(compiler, config)
clientDevServer.listen(4001, (err) => { console.error(err) })

