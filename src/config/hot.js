import { registerPluginProxy, createNewServerProxy } from './hot-server'
import { log } from '../server/utilities/logger'

let currentApp = createNewServerProxy()

if (module.hot) {
  module.hot.accept('./hot-server', async function() {
    await currentApp.stop({ timeout: 0 })
    currentApp = createNewServerProxy()
    await registerPluginProxy(currentApp)
    await currentApp.start()
    log.info('🔁  HMR Reloading `./hot-server`...')
  })
  log.info('✅  Server-side HMR Enabled!')
}

registerPluginProxy(currentApp).then(() => {
  currentApp.start()
})

log.info(`Server started at: ${currentApp.info.uri}\n`)
