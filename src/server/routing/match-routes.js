import pathToRegexp from 'path-to-regexp'

const compilePath = (pattern, options) => {
  const keys = []
  const re = pathToRegexp(pattern, keys, options)
  return { re, keys }
}

const matchPath = (pathname, route = {}) => {
  const { path = '', exact = false, strict = false, sensitive = false } = route

  const { re, keys } = compilePath(path, { end: exact, strict, sensitive })
  const match = re.exec(pathname)

  if (!match) return null

  const [url, ...values] = match
  const isExact = pathname === url

  if (exact && !isExact) return null

  return {
    path, // the path pattern used to match
    url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
    isExact, // whether or not we matched exactly
    params: keys.reduce((memo, key, index) => {
      memo[key.name] = values[index]
      return memo
    }, {})
  }
}

const matchRoutes = (routes, pathname) => {
  const branch = []

  routes.some(route => {
    const match = matchPath(pathname, route)
    if (match) branch.push({ route, match })
    return match
  })

  if (branch.length > 1)
    console.error('Multiple routes matched, returning first match')

  return branch[0]
}

export default matchRoutes
