export default ({ server }) => {
  const cacheConfig = {
    // cache static assets for 1 year
    privacy: 'public',
    expiresIn: parseInt(process.env.STATIC_CACHE_CONTROL_MAX_AGE, 10) || 0
  }

  // Static folders
  const staticPaths = ['.tapestry/_assets', 'public']

  staticPaths.map(path => {
    server.route({
      method: 'GET',
      path: `/${path}/{param*}`,
      config: {
        cache: path === '_assets' && cacheConfig
      },
      handler: {
        directory: {
          path,
          redirectToSlash: true,
          index: true
        }
      }
    })
  })
}
