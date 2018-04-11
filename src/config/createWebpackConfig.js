const webpack = require('webpack')
const path = require('path')
const fs = require('fs-extra')

const AssetsPlugin = require('assets-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const FriendlyErrorsPlugin = require('razzle-dev-utils/FriendlyErrorsPlugin')
const nodeExternals = require('webpack-node-externals')
const StartServerPlugin = require('start-server-webpack-plugin')
const StatsPlugin = require('stats-webpack-plugin')

const paths = require('./paths')

const nodeDevEntry = ['webpack/hot/poll?1000', paths.ownDevServer]

const nodeProdEntry = [paths.ownProdServer]

const nodeDevOutput = {
  path: paths.appBuild,
  filename: 'server.js'
}

const nodeProdOutput = {
  path: paths.appBuild,
  filename: 'server.production.js',
  libraryTarget: 'commonjs2'
}

const nodeDevPlugins = [
  new StartServerPlugin({
    name: 'server.js',
    signal: false
  }),
  new webpack.NamedModulesPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new FriendlyErrorsPlugin({
    target: 'node',
    onSuccessMessage: 'Tapestry Lite is Running',
    verbose: process.env.NODE_ENV === 'test'
  }),
  new webpack.DefinePlugin({ __DEV__: true })
]

const nodeProdPlugins = [new webpack.DefinePlugin({ __DEV__: false })]

const webDevEntry = {
  client: [
    'webpack-dev-server/client?http://localhost:4001/',
    'webpack/hot/only-dev-server',
    paths.ownClientIndex
  ]
}

const webProdEntry = {
  client: [paths.ownClientIndex]
}

const webDevOutput = {
  path: paths.appBuildPublic,
  publicPath: 'http://localhost:4001',
  pathinfo: true,
  filename: 'static/js/bundle.js',
  chunkFilename: 'static/js/[name].chunk.js',
  devtoolModuleFilenameTemplate: info => {
    return path.resolve(info.resourcePath).replace(/\\/g, '/')
  }
}

const webProdOutput = {
  path: paths.appBuildPublic,
  sourceMapFilename: '[name].[chunkhash].map',
  filename: '[name].[chunkhash].js',
  publicPath: '/_assets/'
}

const webDevPlugins = [
  new webpack.NamedModulesPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new webpack.DefinePlugin({
    __CSS_PLUGIN__:
      JSON.stringify(process.env.CSS_PLUGIN) || JSON.stringify('glamor'),
    __DEV__: true
  })
]

const webProdPlugins = [
  new StatsPlugin('../stats.json'),
  new AssetsPlugin({
    path: paths.appBuild,
    filename: 'assets.json'
  }),
  new webpack.DefinePlugin({
    __CSS_PLUGIN__:
      JSON.stringify(process.env.CSS_PLUGIN) || JSON.stringify('glamor'),
    __DEV__: false
  })
]

module.exports = (target = 'node') => {
  const IS_NODE = target === 'node'
  const IS_WEB = target === 'web'
  const IS_DEV =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
  const IS_PROD = process.env.NODE_ENV === 'production'

  const NODE_DEV = IS_NODE && IS_DEV
  const NODE_PROD = IS_NODE && IS_PROD
  const WEB_DEV = IS_WEB && IS_DEV
  const WEB_PROD = IS_WEB && IS_PROD

  // console.log({ IS_NODE }, { IS_WEB }, { IS_DEV }, { IS_PROD })

  const mainBabelOptions = {
    babelrc: true,
    cacheDirectory: true,
    presets: [require('babel-preset-razzle')],
    plugins: [
      process.env.CSS_PLUGIN === 'emotion' && require('babel-plugin-emotion'),
      WEB_DEV && require('react-hot-loader/babel')
    ].filter(Boolean)
  }

  const whenEnvIs = (condition, config) => (condition ? config : null)

  let config = {
    devtool: IS_DEV ? 'cheap-module-source-map' : false,
    mode: IS_DEV ? 'development' : 'production',
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
            publicPath: IS_DEV ? 'http://localhost:4001' : '/_assets',
            emitFile: IS_DEV || IS_WEB
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
    watch: IS_NODE && IS_DEV,
    target: target,
    externals: [
      IS_NODE &&
        nodeExternals({
          whitelist: ['webpack/hot/poll?1000']
        }),
      IS_NODE &&
        nodeExternals({
          modulesDirs: [paths.appNodeModules],
          whitelist: ['webpack/hot/poll?1000']
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
  if (WEB_PROD) {
    config.optimization = {
      runtimeChunk: true,
      splitChunks: {
        chunks: 'all'
      }
    }
  }
  config.plugins.push(
    new CleanPlugin(['.tapestry'], {
      root: process.cwd(),
      verbose: false
    })
  )
  // Sweet jesus
  if (fs.existsSync(paths.appWebpackConfig)) {
    const appWebpackConfig = require(paths.appWebpackConfig)
    config = appWebpackConfig(config, {}, webpack)
  }
  return config
}
