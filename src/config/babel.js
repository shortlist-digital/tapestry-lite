'use strict'

module.exports = target => {
  const { NODE_ENV, CSS_PLUGIN } = process.env
  // set @babel/preset-env default options
  const presetEnvOptions = {
    modules: false, // don't convert to commonjs, retain es modules
    useBuiltIns: 'usage', // only polyfill from whats used
    targets: {}
  }
  // targeting node, no need to transpile a bunch of features
  // outputs a small server build
  if (target === 'node') presetEnvOptions.targets.node = 'current'

  const config = {
    presets: [
      [require.resolve('@babel/preset-env'), presetEnvOptions],
      require.resolve('@babel/preset-react')
    ],
    plugins: [
      // class { handleThing = () => { } }
      require.resolve('@babel/plugin-proposal-class-properties'),
      // { ...todo, completed: true }
      [
        require.resolve('@babel/plugin-proposal-object-rest-spread'),
        { useBuiltIns: true }
      ],
      // Adds syntax support for import()
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      // Add support for async/await
      require.resolve('@babel/plugin-transform-runtime')
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
      require.resolve('@babel/plugin-transform-react-jsx-source'),
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
        require.resolve('@babel/plugin-transform-modules-commonjs'),
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