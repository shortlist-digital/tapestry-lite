const fs = require('fs-extra')
const path = require('path')
const webpack = require('webpack')
const merge = require('babel-merge')

const AssetsPlugin = require('assets-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const StartServerPlugin = require('start-server-webpack-plugin')
const StatsPlugin = require('stats-webpack-plugin')
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')

const babelDefaultConfig = require('./babel')
const { env, helpers } = require('./env')
const paths = require('./paths')

module.exports = (target = 'node') => {
  const { IS_WEB, IS_DEV, NODE_DEV, NODE_PROD, WEB_DEV, WEB_PROD } = helpers(
    target
  )

  let babelConfig

  if (fs.existsSync(paths.appBabelRc)) {
    if (IS_WEB) console.log('Using .babelrc defined in your app root')
    const babelAppConfig = fs.readJsonSync(paths.appBabelRc)
    babelConfig = merge(babelDefaultConfig(target), babelAppConfig)
  } else {
    babelConfig = babelDefaultConfig(target)
  }

  let babelOptions = {
    babelrc: false,
    cacheDirectory: true,
    ...babelConfig
  }

  let config = {
    devtool: IS_DEV ? 'cheap-module-source-map' : false,
    mode: IS_DEV ? 'development' : 'production',
    target,
    watch: NODE_DEV,
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
          options: babelOptions
        },
        {
          test: /\.(css|jpe?g|png|svg|ico|woff(2)?)$/,
          loader: require.resolve('file-loader'),
          options: {
            publicPath: IS_DEV ? 'http://localhost:4001' : '/_assets',
            emitFile: WEB_DEV || WEB_PROD
          }
        }
      ]
    },
    plugins: []
  }

  if (NODE_DEV) {
    Object.assign(config, {
      entry: ['webpack/hot/poll?1000', paths.ownDevServer],
      output: {
        path: paths.appBuild,
        filename: 'server.js'
      },
      plugins: [
        new StartServerPlugin({
          name: 'server.js',
          signal: false
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new FriendlyErrorsPlugin({
          clearConsole: process.env.NODE_ENV !== 'test'
        })
      ],
      externals: [
        nodeExternals({
          modulesDirs: [paths.appNodeModules],
          whitelist: ['webpack/hot/poll?1000']
        })
      ].filter(Boolean)
    })
  }

  if (NODE_PROD) {
    Object.assign(config, {
      entry: [paths.ownProdServer],
      output: {
        path: paths.appBuild,
        filename: 'server.production.js',
        libraryTarget: 'commonjs2'
      },
      externals: [nodeExternals({ modulesDirs: [paths.appNodeModules] })]
    })
  }

  if (WEB_DEV) {
    Object.assign(config, {
      entry: {
        client: [
          'webpack-dev-server/client?http://localhost:4001/',
          'webpack/hot/only-dev-server',
          paths.ownClientIndex
        ]
      },
      output: {
        path: paths.appBuildPublic,
        publicPath: 'http://localhost:4001/',
        pathinfo: true,
        filename: 'static/js/bundle.js',
        chunkFilename: 'static/js/[name].chunk.js',
        devtoolModuleFilenameTemplate: info =>
          path.resolve(info.resourcePath).replace(/\\/g, '/')
      },
      plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new ErrorOverlayPlugin()
      ],
      devServer: {
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
        noInfo: false,
        overlay: true,
        stats: 'none',
        port: 8080,
        quiet: false,
        // By default files from `contentBase` will not trigger a page reload.
        // Reportedly, this avoids CPU overload on some systems.
        // https://github.com/facebookincubator/create-react-app/issues/293
        watchOptions: {
          ignored: /node_modules/
        }
      }
    })
  }

  if (WEB_PROD) {
    Object.assign(config, {
      entry: {
        client: [paths.ownClientIndex]
      },
      output: {
        path: paths.appBuildPublic,
        sourceMapFilename: '[name].[chunkhash].map',
        filename: '[name].[chunkhash].js',
        publicPath: '/_assets/'
      },
      plugins: [
        new StatsPlugin('../stats.json'),
        new AssetsPlugin({
          filename: 'assets.json',
          path: paths.appBuild,
          prettyPrint: true
        })
      ],
      optimization: {
        runtimeChunk: true,
        splitChunks: {
          chunks: 'all'
        }
      }
    })
  }

  config.plugins.push(
    new CleanPlugin(['.tapestry'], {
      root: process.cwd(),
      verbose: WEB_PROD ? false : true
    }),
    new webpack.DefinePlugin(env(target))
  )

  // use custom webpack config
  if (fs.existsSync(paths.appWebpackConfig)) {
    let customConfig = require(paths.appWebpackConfig)
    config =
      typeof customConfig === 'function'
        ? customConfig(config, {}, webpack)
        : customConfig.default(config, {}, webpack)
  }

  return config
}
