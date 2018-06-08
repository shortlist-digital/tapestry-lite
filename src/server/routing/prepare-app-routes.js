import errorView from '../render/error-view'

export default config => {
  let routes = config.routes
  // import and use default routes if user has not defined any routes
  if (!routes) routes = require('./default-routes').default(config.components)
  const preparedRoutes = routes.map(route => ({ ...route, exact: true }))
  // add a default "not found" route
  preparedRoutes.push({
    path: '(.*)',
    notFoundRoute: true,
    component: errorView({ config })
  })
  return preparedRoutes
}
