import Hapi from 'hapi'

import DynamicRouteHandler from './handlers/dynamic'
import ProxyHandler from './handlers/proxy'
import PurgeHandler from './handlers/purge'
import RedirectHandler from './handlers/redirect'
import StaticHandler from './handlers/static'

import CacheManager from './utilities/cache-manager'

// Create CacheManager Singleton
new CacheManager()

class Server {
  constructor({ config }) {
    // Create Hapi server instance
    const server = Hapi.server({
      host: process.env.HOST || 'localhost',
      port: parseInt(process.env.PORT, 10) || 3000,
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
    // Add Tapestry header
    server.ext('onPreResponse', (request, h) => {
      if (request.response.headers)
        request.response.headers['X-Powered-By'] = 'Tapestry'
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
}

export default Server
