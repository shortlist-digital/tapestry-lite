export default ({ server, config }) => {
  if (!config.proxyPaths) return
  config.proxyPaths.map(path => {
    server.route({
      method: 'GET',
      path: `${path}`,
      handler: (request, h) => {
        return h.proxy({
          uri: config.siteUrl + path
        })
      }
    })
  })
}
