import Hapi from 'hapi'
import Inert from 'inert'

import DynamicRouteHandler from './handlers/dynamic'

export default class TapestryLite {
  constructor({ config, assets = {} }) {
    this.server = Hapi.server({ port: 3000 })

    this.server.route({
      method: 'GET',
      path: '/favicon.ico',
      handler: (request, h) => {
        return h.redirect('/public/favicon.ico')
          .permanent()
          .rewritable(false)
      }
    })

    const data = {
      config: config,
      server: this.server
    }

    DynamicRouteHandler(data)

    return this.server
  }
}
