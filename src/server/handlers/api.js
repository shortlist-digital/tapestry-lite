import baseUrlResolver from '../utilities/base-url-resolver'
import prepareAppRoutes from '../routing/prepare-app-routes'
import matchRoutes from '../routing/match-routes'

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
      const { route } = matchRoutes(prepareAppRoutes(config), url.pathname)
      const base = baseUrlResolver(config, params.query, route)
      return h.proxy({
        uri: `${base}/${params.query}${url.search || ''}`,
        passThrough: true
      })
    }
  })
}
