const webpack = require('webpack')
const createWebpackConfig = require('../src/config/createWebpackConfig')

const serverConfig = createWebpackConfig('node')
console.log({serverConfig})
const serverCompiler = webpack(serverConfig)

const clientConfig = createWebpackConfig('web')
const clientCompiler = webpack(clientConfig)

serverCompiler.run((err, stats ) => {
  if (err || stats.hasErrors()) {
    console.log('Server Compiler')
    console.error(err || stats.hasErrors())
  }
  console.log('Built Server')
  console.log(stats.toString({
    chunks: false,  // Makes the build much quieter
    colors: true    // Shows colors in the console
  }))
  clientCompiler.run(() => {
    console.log('Build Client')
  })
})
