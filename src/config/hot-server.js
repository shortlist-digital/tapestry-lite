import Server, { registerPlugins } from '../server'
import appConfig from './config-proxy'

const createNewServerProxy = function() {
  return new Server({ config: appConfig })
}

const registerPluginProxy = async server => {
  // Register plugins
  return registerPlugins({ config: appConfig, server: server })
}

export { registerPluginProxy, createNewServerProxy }
