'use strict'

const config = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        modules: false,
        useBuiltIns: 'usage'
      }
    ],
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

const env = process.env.NODE_ENV

if (env !== 'development' && env !== 'test' && env !== 'production') {
  throw new Error(
    `Using "tapestry-lite" requires that you specify "NODE_ENV" environment variables. Valid values are "development", "test", and "production". Instead, received: ${JSON.stringify(
      process.env.NODE_ENV
    )}.`
  )
}

if (env === 'development' || env === 'test') {
  config.plugins.push.apply(config.plugins, [
    // Adds component stack to warning messages
    require.resolve('@babel/plugin-transform-react-jsx-source'),
    require.resolve('react-hot-loader/babel')
  ])
}

if (process.env.CSS_PLUGIN === 'emotion') {
  config.plugins.push.apply(config.plugins, [
    require.resolve('babel-plugin-emotion')
  ])
}

if (env === 'test') {
  config.plugins.push.apply(config.plugins, [
    // Transform ES modules to commonjs for Jest support
    [
      require.resolve('@babel/plugin-transform-modules-commonjs'),
      { loose: true }
    ]
  ])
}

if (env === 'production') {
  config.plugins.push.apply(config.plugins, [
    require.resolve('babel-plugin-transform-react-remove-prop-types')
  ])
}

module.exports = config
