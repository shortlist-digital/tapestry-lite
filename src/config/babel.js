const fs = require('fs-extra')
const paths = require('./paths')

module.exports = (target = 'node', opts = {}) => {
  const { NODE_ENV, CSS_PLUGIN } = process.env
  // set @babel/preset-env default options
  const presetEnvOptions = {
    modules: false // retain es modules
  }

  if (fs.existsSync(paths.appBrowerslist)) {
    const browsers = fs.readFileSync(paths.appBrowerslist, 'utf8')
    presetEnvOptions.targets = {
      browsers: browsers.split('\n').filter(Boolean)
    }
  }
  // targeting node, no need to transpile a bunch of features
  // outputs a small server build
  if (target === 'node')
    presetEnvOptions.targets = {
      node: 'current'
    }

  if (opts.module)
    presetEnvOptions.targets = {
      browsers: [
        'Chrome >= 60',
        'Safari >= 11',
        'iOS >= 10.3',
        'Firefox >= 54',
        'Edge >= 15'
      ]
    }

  const config = {
    presets: [
      [require.resolve('babel-preset-env'), presetEnvOptions],
      require.resolve('babel-preset-react')
    ],
    plugins: [
      // handle loadable(() => import('./component'))
      require.resolve('loadable-components/babel'),
      // class { handleThing = () => { } }
      require.resolve('babel-plugin-transform-class-properties'),
      // { ...todo, completed: true }
      [
        require.resolve('babel-plugin-transform-object-rest-spread'),
        { useBuiltIns: true }
      ],
      // Adds syntax support for import()
      require.resolve('babel-plugin-syntax-dynamic-import'),
      // Add support for async/await
      require.resolve('babel-plugin-transform-runtime')
    ]
  }

  if (!['development', 'test', 'production'].includes(NODE_ENV)) {
    throw new Error(
      `Using "tapestry-lite" requires that you specify "NODE_ENV" environment variables. Valid values are "development", "test", and "production". Instead, received: ${JSON.stringify(
        NODE_ENV
      )}.`
    )
  }

  if (NODE_ENV === 'development' || NODE_ENV === 'test') {
    config.plugins.push.apply(config.plugins, [
      // Adds component stack to warning messages
      require.resolve('babel-plugin-transform-react-jsx-source'),
      require.resolve('react-hot-loader/babel')
    ])
  }

  if (CSS_PLUGIN === 'emotion') {
    config.plugins.push.apply(config.plugins, [
      require.resolve('babel-plugin-emotion')
    ])
  }

  if (NODE_ENV === 'test') {
    config.plugins.push.apply(config.plugins, [
      // Transform ES modules to commonjs for Jest support
      [
        require.resolve('babel-plugin-transform-es2015-modules-commonjs'),
        { loose: true }
      ]
    ])
  }

  if (NODE_ENV === 'production') {
    config.plugins.push.apply(config.plugins, [
      require.resolve('babel-plugin-transform-react-remove-prop-types')
    ])
  }
  return config
}
