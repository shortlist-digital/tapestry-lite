if (process.env.SERVER_SOURCE_MAPS) {
  require('source-map-support').install()
}
import Server, { registerPlugins } from '../server'
import appConfig from './config-proxy'

export default async function() {
  let currentApp
  console.log('Run was called')
  try {
    currentApp = new Server({ config: appConfig })
    // Register plugins
    await registerPlugins({ config: appConfig, server: currentApp })
    // Start server
    await currentApp.start()
    console.log('Server started at: ' + currentApp.info.uri)
  } catch (e) {
    console.error(e)
  }
}
