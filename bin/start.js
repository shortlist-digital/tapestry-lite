const chalk = require('chalk')
const fs = require('fs-extra')
const throng = require('throng')
const log = require('../src/server/utilities/logger').log
const paths = require('../src/config/paths')

// detect scripts have been created before running server
if (!fs.existsSync(paths.appBuildServerProduction)) {
  log.error(
    `Tapestry scripts missing, make sure to run ${chalk.green(
      'tapestry build'
    )} before running`
  )
  process.exit(0)
}
// require server and boot
const server = require(paths.appBuildServerProduction).default
if (process.env.ENABLE_CONCURRENCY) {
  const WORKERS =
    process.env.WEB_CONCURRENCY || require('os').cpus().length || 1
  throng(WORKERS, () => server())
  log.info('Started ' + process.env.WEB_CONCURRENCY + ' processes')
} else {
  server()
  log.info('Started server')
}
