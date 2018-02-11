import Hapi from 'hapi'

import DynamicRouteHandler from './handlers/dynamic'

const server = Hapi.server({ port: 3000 })

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


export default server
