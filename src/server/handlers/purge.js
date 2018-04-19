import HTTPStatus from 'http-status'
import CacheManager from '../utilities/cache-manager'

export default ({ server }) => {
  const cacheManager = new CacheManager()
  const purgePath = process.env.SECRET_PURGE_PATH || 'purge'
  server.route({
    method: 'GET',
    path: `/${purgePath}/{path*}`,
    handler: (request, h) => {
      // as hapi strips the trailing slash
      const path = request.params.path || '/'
      cacheManager.clearCache('html', path)
      return h
        .response({
          status: `Purged ${path}`
        })
        .code(HTTPStatus.OK)
    }
  })
}
