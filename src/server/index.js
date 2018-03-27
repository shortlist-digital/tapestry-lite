import Hapi from 'hapi'
import Inert from 'inert'
import h2o2 from 'h2o2'

import DynamicRouteHandler from './handlers/dynamic'
import RedirectHandler from './handlers/redirect'
import ProxyHandler from './handlers/proxy'
import PurgeHandler from './handlers/purge'
import StaticHandler from './handlers/static'
import CacheManager from './utilities/cache-manager'
import { log } from './utilities/logger'

// Create CacheManager Singleton
new CacheManager()

class Server {
  constructor({ config }) {
    this.server = Hapi.server({
      port: process.env.PORT || 3000
    })

    this.server.route({
      method: 'GET',
      path: '/favicon.ico',
      handler: (request, h) => {
        return h
          .redirect('/public/favicon.ico')
          .permanent()
          .rewritable(false)
      }
    })

    this.server.ext('onPreResponse', ({ response }, h) => {
      // isServer indicates status code >= 500
      //  if error, pass it through server.log
      if (response && response.isBoom && response.isServer) {
        console.error(response.error || response.message)
      }
      return h.continue
    })

    const data = {
      config,
      server: this.server
    }

    PurgeHandler(data)
    RedirectHandler(data)
    DynamicRouteHandler(data)

    return this.server
  }
}

export const registerPlugins = async data => {
  // gotta register the plugins before using em
  await data.server.register([h2o2, Inert])
  StaticHandler(data)
  ProxyHandler(data)
}

export default Server
