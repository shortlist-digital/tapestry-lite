const webpack = require('webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const StartServerPlugin = require('start-server-webpack-plugin')
const FriendlyErrorsPlugin = require('razzle-dev-utils/FriendlyErrorsPlugin')

const mainBabelOptions = {
  babelrc: true,
  cacheDirectory: true,
  presets: [
    require('babel-preset-razzle')
  ]
}

module.exports = () => {
  return {
    mode: process.env.NODE_ENV || 'development',
    module: {
      strictExportPresence: true,
      rules: [
        // Transform ES6 with Babel
        {
          test: /\.(js|jsx|mjs)$/,
          loader: require.resolve('babel-loader'),
          options: mainBabelOptions,
        },
      ]
    },
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
        target: 'node',
        onSuccessMessage: 'Tapestry Lite is Running'
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
