const spawn = require('react-dev-utils/crossSpawn')
const paths = require('../src/config/paths')
const args = process.argv.slice(3)

spawn.sync('node', [paths.appBuildServerProduction].concat(args), {
  stdio: 'inherit'
})
