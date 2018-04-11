'use strict'

const preset = {
  cacheDirectory: true,
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

    // The following two plugins use Object.assign directly, instead of Babel's
    // extends helper. Note that this assumes `Object.assign` is available.
    // { ...todo, completed: true }
    [
      require.resolve('@babel/plugin-syntax-object-rest-spread'),
      {
        useBuiltIns: true
      }
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
  preset.plugins.push.apply(preset.plugins, [
    // Adds component stack to warning messages
    require.resolve('@babel/plugin-transform-react-jsx-source'),
    require.resolve('react-hot-loader/babel')
  ])
}

if (process.env.CSS_PLUGIN === 'emotion') {
  preset.plugins.push.apply(preset.plugins, [
    require.resolve('babel-plugin-emotion')
  ])
}

if (env === 'test') {
  preset.plugins.push.apply(preset.plugins, [
    // Compiles import() to a deferred require()
    require.resolve('@babel/plugin-syntax-dynamic-import'),
    // Transform ES modules to commonjs for Jest support
    [
      require.resolve('@babel/plugin-transform-modules-commonjs'),
      { loose: true }
    ]
  ])
}

if (env === 'production') {
  preset.plugins.push.apply(preset.plugins, [
    require.resolve('babel-plugin-transform-react-remove-prop-types')
  ])
}

module.exports = preset
