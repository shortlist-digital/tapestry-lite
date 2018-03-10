import TapestryLite from './server'
import Inert from 'inert'
import h2o2 from 'h2o2'
import appConfig from 'tapestry.config.js'

let currentApp
const timeLabel = 'Hot Reload Restart'

const serverPlugins = [
  Inert,
  h2o2
]

const run = async function() {
  console.log('Run was called')
  try {
    currentApp = new TapestryLite(appConfig)
    // Register plugins
    await currentApp.register(serverPlugins)
    // Start server
    await currentApp.start()
    if (module.hot) {
      module.hot.accept('./server', async function() {
        console.log(timeLabel)
        await currentApp.stop({ timeout: 0 })
        currentApp = new TapestryLite(appConfig)
        // // Re-register plugins
        await currentApp.register(serverPlugins)
        await currentApp.start()
        console.log(timeLabel)
      })
    } 
    console.log('Server started at: ' + currentApp.info.uri)
  } catch (e) {
    console.error(e)
  }
}

run()
