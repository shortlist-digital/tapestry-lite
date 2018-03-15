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
  presets: [require('babel-preset-razzle')],
  plugins: [require('react-hot-loader/babel')]
}

module.exports = () => {
  let config = {
    devtool: (process.env.NODE_ENV == 'test') ? false : 'cheap-module-source-map',
    mode: process.env.ENV || 'development',
    resolve: {
      modules: [paths.appNodeModules, paths.ownNodeModules],
      extensions: ['.js', '.json', '.jsx', '.mjs'],
      alias: {
        // This is required so symlinks work during development.
        'webpack/hot/poll': require.resolve('webpack/hot/poll'),
        'tapestry.config.js': paths.appTapestryConfig
      }
    },
    resolveLoader: {
      modules: [paths.appNodeModules, paths.ownNodeModules]
    },
    module: {
      strictExportPresence: true,
      rules: [
        // Transform ES6 with Babel
        {
          test: /\.(js|jsx|mjs)$/,
          loader: require.resolve('babel-loader'),
          exclude: /node_modules(?!\/tapestry-lite)/,
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
    entry: ['webpack/hot/poll?1000', paths.ownDevServer],
    watch: true,
    target: 'node',
    externals: [
      nodeExternals({
        whitelist: ['webpack/hot/poll?1000', 'tapestry-lite']
      })
    ],
    plugins: [
      new FriendlyErrorsPlugin({
        target: 'node',
        onSuccessMessage: 'Tapestry Lite is Running',
        verbose: process.env.NODE_ENV === 'test'
      }),
      new StartServerPlugin({
        name: 'server.js',
        signal: false
      }),
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        __DEV__: true
      })
    ],
    output: {
      path: paths.appBuild,
      filename: 'server.js'
    }
  }
  if (fs.existsSync(paths.appWebpackConfig)) {
    const appWebpackConfig = require(paths.appWebpackConfig)
    config = appWebpackConfig(config, {}, webpack)
  }
  return config
}
