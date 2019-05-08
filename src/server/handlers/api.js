import baseUrlResolver from '../utilities/base-url-resolver'

export default ({ server, config }) => {
  server.route({
    method: 'GET',
    path: '/api/v1/{query*}',
    config: {
      cache: {
        expiresIn:
          (parseInt(process.env.CACHE_CONTROL_MAX_AGE, 10) || 0) * 1000, // 1 Minute
        privacy: 'public'
      }
    },
    handler: ({ params, url }, h) => {
      // get matching route and match data
      const base = baseUrlResolver(config)
      return h.proxy({
        uri: `${base}/${params.query}${url.search || ''}`,
        passThrough: true
      })
    }
  })
}
