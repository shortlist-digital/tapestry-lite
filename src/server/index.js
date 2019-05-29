import 'make-promises-safe'
import Hapi from 'hapi'

import DynamicRouteHandler from './handlers/dynamic'
import ProxyHandler from './handlers/proxy'
import PurgeHandler from './handlers/purge'
import RedirectHandler from './handlers/redirect'
import StaticHandler from './handlers/static'
import ApiHandler from './handlers/api'

import CacheManager from './utilities/cache-manager'

// Create CacheManager Singleton
new CacheManager()

class Server {
  constructor({ config }) {
    // Create Hapi server instance
    const server = Hapi.server({
      host: process.env.TAPESTRY_HOST || '0.0.0.0',
      port: process.env.TAPESTRY_PORT || 3000,
      router: {
        isCaseSensitive: false,
        stripTrailingSlash: true
      },
      routes: {
        security: {
          hsts: true,
          noOpen: true,
          noSniff: true,
          xframe: false,
          xss: true
        }
      }
    })

    server.ext('onPreResponse', ({ response }, h) => {
      // isServer indicates status code >= 500
      // if error, pass it through server.log
      if (response && response.isBoom && response.isServer) {
        console.error(response.error || response.message)
      }
      // The important bit
      if (response.headers) response.headers['X-Powered-By'] = 'Tapestry'
      return h.continue
    })
    // Handle server routes
    PurgeHandler({ server })
    RedirectHandler({ config, server })
    DynamicRouteHandler({ config, server })
    // return server instance (not class)
    return server
  }
}

export const registerPlugins = async ({ server, config }) => {
  // Handles static files and proxying
  const plugins = [require('inert'), require('h2o2')]
  // Redirects all internal requests to https
  if (config.forceHttps) {
    plugins.push({
      register: require('hapi-require-https'),
      options: { proxy: false }
    })
  }
  // Register all required plugins before use
  await server.register(plugins)
  StaticHandler({ server })
  ProxyHandler({ server, config })
  ApiHandler({ config, server })
}

export default Server
