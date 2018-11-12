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

serverCompiler.hooks.compile.tap(
  'Tapestry Lite Sever Compile Starting',
  stats => {
    clientDevServer.sockWrite(clientDevServer.sockets, 'server-compile-starts')
    console.log('Emitted server compile end message', stats)
  }
)

serverCompiler.hooks.done.tap('Tapestry Lite Server Compile Complete', () => {
  clientDevServer.sockWrite(clientDevServer.sockets, 'server-compile-ends')
  console.log('Emitted server compile start message')
})

clientDevServer.listen(4001, err => console.error(err))
