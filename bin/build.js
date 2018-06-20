const webpack = require('webpack')
const createWebpackConfig = require('../src/config/createWebpackConfig')

const args = process.argv.slice(2)

const serverConfig = createWebpackConfig('node')
const clientConfig = createWebpackConfig('web')

const configs = [serverConfig, clientConfig]

// create esmodule build
if (args.includes('--module')) {
  configs.push(createWebpackConfig('web', { module: true }))
}

console.log('\nCreating an optimized production build\n')

webpack(configs).run((err, stats) => {
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
