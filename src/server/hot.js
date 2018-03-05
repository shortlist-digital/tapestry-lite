import TapestryLite from './server'
import Inert from 'inert'

let currentApp
const timeLabel = 'Hot Reload Restart'

const serverPlugins = [
  Inert
]

const run = async function() {
  try {
    currentApp = new TapestryLite({})
    // Register plugins
    await currentApp.register(serverPlugins)
    // Start server
    await currentApp.start()
    if (module.hot) {
      module.hot.accept('./server', async function() {
        console.time(timeLabel)
        await currentApp.stop({ timeout: 0 })
        currentApp = new TapestryLite({})
        // Re-register plugins
        await currentApp.register(serverPlugins)
        await currentApp.start()
        console.timeEnd(timeLabel)
      })
    } 
    console.log('Server started at: ' + currentApp.info.uri)
  } catch (e) {
    console.error(e)
  }
}

run()
