import HTTPStatus from 'http-status'
import CacheManager, { getPurgeKey } from '../utilities/cache-manager'
import { log } from '../utilities/logger'

export default ({ server, config }) => {
  const cacheManager = new CacheManager()
  const purgePath = process.env.SECRET_PURGE_PATH || 'purge'

  const clearCache = async key => {
    const feedback = await cacheManager.clearCache('html', key)
    log.silly('Purging path: ', key, 'status: ', feedback)
  }

  server.route({
    method: 'GET',
    path: `/${purgePath}/{path*}`,
    handler: async (request, h) => {
      // as hapi strips the trailing slash
      const key = getPurgeKey(
        request.params.path || '/',
        config.cachePurgeHandler
      )

      if (Array.isArray(key)) {
        key.forEach(clearCache)
      } else {
        clearCache(key)
      }

      return h.response({ status: `Purged ${key}` }).code(HTTPStatus.OK)
    }
  })
}
