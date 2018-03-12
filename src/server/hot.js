import TapestryLite from './server'
import Inert from 'inert'
import h2o2 from 'h2o2'
import appConfig from './config-proxy'

let currentApp
const serverLabel = 'Server Restart:'
const hotReloadLabel = 'Hot Reload:'

const serverPlugins = [
  h2o2,
  Inert
]

const run = async function() {
  console.log('Run was called')
  try {
    currentApp = new TapestryLite({config: appConfig})
    // Register plugins
    await currentApp.register(serverPlugins)
    // Start server
    await currentApp.start()
    if (module.hot) {
      module.hot.accept('./config-proxy', async function() {
        console.time(serverLabel)
        await currentApp.stop({ timeout: 0 })
        currentApp = new TapestryLite({config: require('./config-proxy').default})
        // // Re-register plugins
        await currentApp.register(serverPlugins)
        await currentApp.start()
        console.timeEnd(serverLabel)
      })
    } 
    console.log('Server started at: ' + currentApp.info.uri)
  } catch (e) {
    console.error(e)
  }
}

run()
