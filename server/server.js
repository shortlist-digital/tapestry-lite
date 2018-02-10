import Hapi from 'hapi'

const server = Hapi.server({ port: 3000 })

server.route({
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    console.log('hot reloading?!')
    return h.response('Server OK?!')
      .code(200)
  }
})

export default server
