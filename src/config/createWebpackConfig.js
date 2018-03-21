const AssetsPlugin = require('assets-webpack-plugin')
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

const nodeDevEntry = ['webpack/hot/poll?1000', paths.ownDevServer]

const nodeDevOutput = {
  path: paths.appBuild,
  filename: 'server.js'
}

const nodeDevPlugins = [
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
]

const webDevEntry = {
  client: [
    'webpack-dev-server/client?http://localhost:4001/',
    'webpack/hot/only-dev-server',
    paths.ownClientIndex
  ]
}

const webDevOutput = {
  path: paths.appBuildPublic,
  publicPath: 'http://localhost:4001/',
  pathinfo: true,
  filename: 'static/js/bundle.js',
  chunkFilename: 'static/js/[name].chunk.js',
  devtoolModuleFilenameTemplate: info => {
    return path.resolve(info.resourcePath).replace(/\\/g, '/')
  }
}

const webDevPlugins = [
  new webpack.NamedModulesPlugin(),
  new AssetsPlugin({
    path: paths.appBuild,
    filename: 'assets.json'
  }),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new webpack.DefinePlugin({
    __DEV__: true
  })
]

const nodeProdPlugins = {}
const nodeProdOutput = {}
const nodeProdEntry = {}
const webProdPlugins = {}
const webProdEntry = {}
const webProdOutput = {}

module.exports = (target = 'node', options) => {
  const IS_NODE = target === 'node'
  const IS_WEB = target === 'web'
  const IS_DEV = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
  const IS_PROD = process.env.NODE_ENV === 'production'

  const NODE_DEV = IS_NODE && IS_DEV
  const NODE_PROD = IS_NODE && IS_PROD
  const WEB_DEV = IS_WEB && IS_DEV
  const WEB_PROD = IS_WEB && IS_PROD

  const whenEnvIs = (condition, config) => (condition ? config : null)

  let config = {
    devtool: process.env.NODE_ENV == 'test' ? false : 'cheap-module-source-map',
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
    entry:
      // Sweet jesus
      whenEnvIs(NODE_DEV, nodeDevEntry) ||
      whenEnvIs(NODE_PROD, nodeProdEntry) ||
      whenEnvIs(WEB_DEV, webDevEntry) ||
      whenEnvIs(WEB_PROD, webProdEntry),
    watch: (IS_NODE && IS_DEV) || false,
    target: target,
    externals: [
      IS_NODE &&
        nodeExternals({
          whitelist: ['webpack/hot/poll?1000', 'tapestry-lite']
        })
    ].filter(Boolean),
    plugins:
      // Sweet jesus
      whenEnvIs(NODE_DEV, nodeDevPlugins) ||
      whenEnvIs(NODE_PROD, nodeProdPlugins) ||
      whenEnvIs(WEB_DEV, webDevPlugins) ||
      whenEnvIs(WEB_PROD, webProdPlugins),
    output:
      // Sweet jesus
      whenEnvIs(NODE_DEV, nodeDevOutput) ||
      whenEnvIs(NODE_PROD, nodeProdOutput) ||
      whenEnvIs(WEB_DEV, webDevOutput) ||
      whenEnvIs(WEB_PROD, webProdOutput)
  }
  if (WEB_DEV) {
    config.devServer = {
      disableHostCheck: true,
      clientLogLevel: 'none',
      // Enable gzip compression of generated files.
      compress: true,
      // watchContentBase: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      host: 'localhost',
      hot: true,
      noInfo: true,
      overlay: false,
      port: 8080,
      quiet: true,
      // By default files from `contentBase` will not trigger a page reload.
      // Reportedly, this avoids CPU overload on some systems.
      // https://github.com/facebookincubator/create-react-app/issues/293
      watchOptions: {
        ignored: /node_modules/
      }
    }
  }
  // Sweet jesus
  if (fs.existsSync(paths.appWebpackConfig)) {
    const appWebpackConfig = require(paths.appWebpackConfig)
    config = appWebpackConfig(config, {}, webpack)
  }
  return config
}
