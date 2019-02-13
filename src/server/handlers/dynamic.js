import chalk from 'chalk'

import normaliseUrlPath from '../utilities/normalise-url-path'
import CacheManager from '../utilities/cache-manager'
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

      const { responseString, status } = await tapestryRender(
        currentPath,
        request.query,
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
