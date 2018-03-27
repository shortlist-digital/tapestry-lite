export default ({ server }) => {
  const cacheConfig = {
    // cache static assets for 1 year
    privacy: 'public',
    expiresIn: parseInt(process.env.STATIC_CACHE_CONTROL_MAX_AGE, 10) || 0
  }

  // Static assets from parent project
  server.route({
    method: 'GET',
    path: '/public/{param*}',
    handler: {
      directory: {
        path: 'public/',
        redirectToSlash: true,
        index: true
      }
    }
  })

  // Compiled Assets from Tapestry
  server.route({
    method: 'GET',
    path: '/_assets/{param*}',
    config: {
      cache: cacheConfig
    },
    handler: {
      directory: {
        path: '.tapestry/_assets',
        redirectToSlash: true,
        index: true
      }
    }
  })
}
