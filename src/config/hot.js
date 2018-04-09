import Server, { registerPlugins } from '../server'
import appConfig from './config-proxy'
import { log, notify } from '../server/utilities/logger'

let currentApp

const run = async () => {
  try {
    currentApp = new Server({ config: appConfig })
    // Register plugins
    await registerPlugins({ config: appConfig, server: currentApp })
    // Start server
    await currentApp.start()
    if (module.hot) {
      module.hot.addStatusHandler(async status => {
        if (status === 'ready') {
          await currentApp.stop({ timeout: 0 })
          currentApp = new Server({ config: require('./config-proxy').default })
          // Re-register plugins
          await registerPlugins({
            config: require('./config-proxy').default,
            server: currentApp
          })
          await currentApp.start()
        }
      })
    }
    notify(`Server started at: ${currentApp.info.uri}\n`)
  } catch (e) {
    log.error(e)
  }
}

run()
