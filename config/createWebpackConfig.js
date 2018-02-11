const webpack = require('webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const StartServerPlugin = require('start-server-webpack-plugin')
const FriendlyErrorsPlugin = require('razzle-dev-utils/FriendlyErrorsPlugin')

module.exports = () => {
  return {
    mode: process.env.NODE_ENV || 'development',
    entry: [
      'webpack/hot/poll?1000',
      './server/index'
    ],
    watch: true,
    target: 'node',
    externals: [nodeExternals({
        whitelist: ['webpack/hot/poll?1000']
    })],
    plugins: [
      new FriendlyErrorsPlugin({
        verbose: false,
        target: 'web',  
        onSuccessMessage: `Tapestry Lite is Running`,
      }),
      new StartServerPlugin('server.js'),
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          'BUILD_TARGET': JSON.stringify('server')
        }
      }),
    ],
    output: {
      path: path.join(__dirname, '.build'),
      filename: 'server.js'
    }
  }
}
