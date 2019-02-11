import chalk from 'chalk'

import prepareAppRoutes from '../routing/prepare-app-routes'
import matchRoutes from '../routing/match-routes'

import normaliseUrlPath from '../utilities/normalise-url-path'
import CacheManager from '../utilities/cache-manager'
import { log } from '../utilities/logger'

import tapestryRender from '../render/tapestry-render'

export default ({ server, config }) => {
  const cacheManager = new CacheManager()
  const cache = cacheManager.createCache('html')
  const routes = prepareAppRoutes(config)
  server.route({
    options: {
      cache: {
        expiresIn:
          (parseInt(process.env.CACHE_CONTROL_MAX_AGE, 10) || 0) * 1000, // 1 Minute
        privacy: 'public'
      }
    },
    method: 'GET',
    path: '/{path*}',
    handler: async (request, h) => {
      // Set a cache key
      const currentPath = request.url.pathname || '/'
      const cacheKey = normaliseUrlPath(currentPath)
      // Is there cached HTML?
      const cacheObject = await cache.get(cacheKey)
      // If there's a cache response, return the response straight away
      if (cacheObject) {
        log.debug(`Rendering HTML from cache: ${chalk.green(cacheKey)}`)
        return h
          .response(cacheObject.responseString)
          .type('text/html')
          .code(cacheObject.status)
      }

      const queryParams = request.query

      // Don't even import react-router any more, but backwards compatible
      // With the exception of optional params: (:thing) becomes :thing?
      // Match Routes
      // this should only have one route as we force "exact" on each route
      // How would we error out if two routes match here? "Ambigous routes detected?" maybe earlier in app
      const { route } = matchRoutes(routes, request.url.pathname)

      log.debug(`Matched route ${chalk.green(route.path)}`)

      const requestPath = currentPath
      const requestQuery = queryParams
      const { responseString, status } = await tapestryRender(
        requestPath,
        requestQuery,
        config
      )

      log.debug(`Setting html in cache: ${chalk.green(cacheKey)}`)
      cache.set(cacheKey, { responseString, status })

      return h
        .response(responseString)
        .type('text/html')
        .code(status)
    }
  })
}
