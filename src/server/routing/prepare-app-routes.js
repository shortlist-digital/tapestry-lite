import errorView from '../render/error-view'

export default config => {
  let routes = config.routes
  // import and use default routes if user has not defined any routes
  if (!routes) routes = require('./default-routes').default(config.components)
  // add a default "not found" route
  routes.push({
    path: '/*',
    notFoundRoute: true,
    component: errorView({ config })
  })
  return routes
}
