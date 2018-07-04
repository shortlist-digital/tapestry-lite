import isPlainObject from 'lodash.isplainobject'

export default ({ server, config }) => {
  if (!Array.isArray(config.proxyPaths)) return

  const route = ({ from, to }) =>
    server.route({
      method: 'GET',
      path: from,
      handler: (req, h) => h.proxy({ uri: to })
    })

  config.proxyPaths.map(path => {
    // support an object syntax to proxy to a different domain
    // { '/app/something/{feed}': 'https://www.something.com/somewhere/{feed}' }
    if (isPlainObject(path)) {
      // try to keep the proxy objects separate
      // {'': ''}, {'': ''}
      if (Object.keys(path).length > 1) {
        console.error('Proxy object contains more than a single key/value pair')
        return
      }
      // as object only has a single key we can grab the key[0] and value[0]
      return route({
        from: Object.keys(path)[0],
        to: Object.values(path)[0]
      })
    }
    // otherwise treat the string as a traditional proxy to the site URL
    return route({ from: path, to: config.siteUrl + path })
  })
}
