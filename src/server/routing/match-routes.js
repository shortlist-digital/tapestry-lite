import { exec, match, parse } from 'matchit'

export default (routes, pathname) => {
  // returns matchit object schema
  // e.g. [{ old:'/', type:0, val:'/' }]
  const matchedRoute = match(
    pathname,
    routes
      .filter(Boolean)
      .map(route => route.path)
      .map(parse)
  )
  return {
    route: routes
      .filter(Boolean)
      .filter(({ path }) => matchedRoute[0].old === path)[0],
    match: {
      path: pathname,
      params: exec(pathname, matchedRoute)
    }
  }
}
