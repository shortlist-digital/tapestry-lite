import Server, { registerPlugins } from '../server'
import appConfig from './config-proxy'

let currentApp
const serverLabel = 'Server Restart:'
const hotReloadLabel = 'Hot Reload:'

const run = async function() {
  console.log('Run was called')
  try {
    currentApp = new Server({ config: appConfig })
    // Register plugins
    await registerPlugins({ config: appConfig, server: currentApp })
    // Start server
    await currentApp.start()
    if (module.hot) {
      module.hot.addStatusHandler(async function(status) {
        if (status === 'ready') {
          console.log('Hot callback was called')
          console.time(serverLabel)
          await currentApp.stop({ timeout: 0 })
          currentApp = new Server({ config: require('./config-proxy').default })
          // Re-register plugins
          await registerPlugins({
            config: require('./config-proxy').default,
            server: currentApp
          })
          await currentApp.start()
          console.timeEnd(serverLabel)
        }
      })
    }
    console.log('Server started at: ' + currentApp.info.uri)
  } catch (e) {
    console.error(e)
  }
}

run()
