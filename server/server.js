import Hapi from 'hapi'
import Inert from 'inert'

import DynamicRouteHandler from './handlers/dynamic'
import StaticRouteHandler from './handlers/static'

async function provision() {
  const server = Hapi.server({ port: 3000 })

  await server.register(Inert)

  server.route({
    method: 'GET',
    path: '/favicon.ico',
    handler: (request, h) => {
      return h.redirect('/public/favicon.ico')
        .permanent()
        .rewritable(false)
    }
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.response('Server OK')
        .code(200)
    }
  })

  const data = {
    server
  }

  DynamicRouteHandler(data)
  StaticRouteHandler(data)

  return server
}

export default provision
