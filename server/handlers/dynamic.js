import renderHtml from '../render'

export default ({ server }) => {
  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: async function (request, h) {
      const response = renderHtml()
      return h
        .response(response)
        .type('text/html')
        .code(200) 
    }
  })
}

