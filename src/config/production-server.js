if (process.env.SERVER_SOURCE_MAPS) {
  require('source-map-support').install()
}
import Server, { registerPlugins } from '../server'
import { log, notify } from '../server/utilities/logger'
import appConfig from './config-proxy'

export default async function() {
  let currentApp
  try {
    currentApp = new Server({ config: appConfig })
    // Register plugins
    await registerPlugins({ config: appConfig, server: currentApp })
    // Start server
    await currentApp.start()
    notify(`Server started at: ${currentApp.info.uri}\n`)
  } catch (e) {
    log.error(e)
  }
}
