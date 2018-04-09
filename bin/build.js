const webpack = require('webpack')
const createWebpackConfig = require('../src/config/createWebpackConfig')

const serverConfig = createWebpackConfig('node')
const clientConfig = createWebpackConfig('web')

console.log('\nCreating an optimized production build\n')

webpack([serverConfig, clientConfig]).run((err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(err || stats.hasErrors())
  }
  console.log(
    stats.toString({
      chunks: false, // Makes the build much quieter
      colors: true // Shows colors in the console
    })
  )

  console.log('\nCompiled server and client successfully.\n')

  process.exit(0)
})
