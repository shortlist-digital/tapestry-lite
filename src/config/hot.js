import { registerPluginProxy, createNewServerProxy } from './hot-server'
import { notify } from '../server/utilities/logger'

let currentApp = createNewServerProxy()

if (module.hot) {
  module.hot.accept('./hot-server', async function() {
    await currentApp.stop({ timeout: 0 })
    currentApp = createNewServerProxy()
    await registerPluginProxy(currentApp)
    await currentApp.start()
    notify('🔁  HMR Reloading `./hot-server`...')
  })
  notify('✅  Server-side HMR Enabled!')
}

registerPluginProxy(currentApp).then(() => {
  currentApp.start()
})

notify(`Server started at: ${currentApp.info.uri}\n`)
