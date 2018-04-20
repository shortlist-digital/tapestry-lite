import HTTPStatus from 'http-status'
import CacheManager from '../utilities/cache-manager'
import { log } from '../utilities/logger'

export default ({ server }) => {
  const cacheManager = new CacheManager()
  const purgePath = process.env.SECRET_PURGE_PATH || 'purge'
  server.route({
    method: 'GET',
    path: `/${purgePath}/{path*}`,
    handler: async (request, h) => {
      // as hapi strips the trailing slash
      const path = request.params.path || '/'
      const cacheFeedback = await cacheManager.clearCache('html', path)
      log.silly('Purging path: ', path, 'status: ', cacheFeedback)
      return h
        .response({
          status: `Purged ${path}`
        })
        .code(HTTPStatus.OK)
    }
  })
}
