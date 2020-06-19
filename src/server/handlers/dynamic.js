import chalk from 'chalk'

import CacheManager, { getCacheKey } from '../utilities/cache-manager'
import { log } from '../utilities/logger'

import tapestryRender from '../render/tapestry-render'

export default ({ server, config }) => {
  const cacheManager = new CacheManager()
  const cache = cacheManager.createCache('html')

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
      const isPreview = Boolean(request.query && request.query.tapestry_hash)
      // Is there cached HTML?
      const cacheKey = getCacheKey(currentPath, request, config.cacheKeyHandler)
      const cacheString = await cache.get(cacheKey)
      // If there's a cache response, return the response straight away
      if (!currentPath.includes('/books/') && cacheString && !isPreview) {
        const cacheObject = JSON.parse(cacheString)
        log.debug(`Rendering HTML from cache: ${chalk.green(cacheKey)}`)
        return h
          .response(cacheObject.responseString)
          .type('text/html')
          .code(cacheObject.status)
      } else {
        log.debug(`Skipping cache: ${chalk.green(cacheKey)}`)
      }
      // Get headers and filter by client config
      const headers = {}
      const configHeaders = config.headers
      const requestHeaders = request.headers
      if (Array.isArray(configHeaders))
        configHeaders.forEach(key => {
          Object.keys(requestHeaders).includes(key)
            ? (headers[key] = requestHeaders[key])
            : (headers[key] = null)
        })

      const { responseString, status } = await tapestryRender(
        currentPath,
        request.query,
        config,
        headers
      )

      const response = h
        .response(responseString)
        .type('text/html')
        .code(status)

      // cache _must_ be set after response is created
      if (!isPreview) {
        log.debug(`Setting html in cache: ${chalk.green(cacheKey)}`)
        cache.set(cacheKey, JSON.stringify({ responseString, status }))
      }

      if (isPreview) {
        response.header('cache-control', 'no-cache')
      }

      return response
    }
  })
}
