const webpack = require('webpack')
const path = require('path')
const fs = require('fs-extra')
const nodeExternals = require('webpack-node-externals')
const StartServerPlugin = require('start-server-webpack-plugin')
const FriendlyErrorsPlugin = require('razzle-dev-utils/FriendlyErrorsPlugin')
const paths = require('./paths')

const mainBabelOptions = {
  babelrc: true,
  cacheDirectory: true,
  presets: [
    require('babel-preset-razzle')
  ]
}

module.exports = () => {

  let config = {
    mode: process.env.ENV || 'development',
    resolve: {
      modules: ['node_modules', './test-app/node_modules'],
      extensions: ['.js', '.json', '.jsx', '.mjs'],
      alias: {
        // This is required so symlinks work during development.
        'webpack/hot/poll': require.resolve('webpack/hot/poll'),
        'tapestry.config.js': paths.appTapestryConfig
      },
    },
    resolveLoader: {
      modules: [paths.appNodeModules, paths.ownNodeModules],
    },
    module: {
      strictExportPresence: true,
      rules: [
        // Transform ES6 with Babel
        {
          test: /\.(js|jsx|mjs)$/,
          loader: require.resolve('babel-loader'),
          options: mainBabelOptions
        },
        {
          test: /\.(css|jpe?g|png|svg|ico|woff(2)?)$/,
          loader: require.resolve('file-loader'),
          options: {
            publicPath: '/_assets/'
          }
        }
      ]
    },
    entry: [
      'webpack/hot/poll?1000',
      paths.ownDevServer
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
  if (fs.existsSync('./test-app/webpack.config.js')) {
    const appWebpackConfig = require('../../test-app/webpack.config.js')
    config = appWebpackConfig(
      config,
      {},
      webpack
    )
  }
  console.log({config})
  return config
}
