import { registerPluginProxy, createNewServerProxy } from './hot-server'

let currentApp = createNewServerProxy()

if (module.hot) {
  module.hot.accept('./hot-server', async function() {
    await currentApp.stop({ timeout: 0 })
    currentApp = createNewServerProxy()
    await registerPluginProxy(currentApp)
    await currentApp.start()
    console.log('🔁  HMR Reloading `./hot-server`...')
  })
  console.info('✅  Server-side HMR Enabled!')
}

registerPluginProxy(currentApp).then(() => {
  currentApp.start()
})
