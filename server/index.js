import server from './server'
import Inert from 'inert'

let currentApp
const timeLabel = 'Hot Reload Restart'

const serverPlugins = [
  Inert
]

const run = async function() {
  try {
    currentApp = server
    // Register plugins
    await server.register(serverPlugins)
    // Start server
    await currentApp.start()
    if (module.hot) {
      module.hot.accept('./server', async function() {
        console.time(timeLabel)
        await currentApp.stop({ timeout: 0 })
        currentApp = server
        // Re-register plugins
        await server.register(serverPlugins)
        await currentApp.start()
        console.timeEnd(timeLabel)
      })
    } 
    console.log('Server started at: ' + server.info.uri)
  } catch (e) {
    console.error(e)
  }
}

run()
