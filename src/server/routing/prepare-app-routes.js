import buildErrorView from '../render/error-view'

export default config => {
  let routes = config.routes
  // import and use default routes if user has not defined any routes
  if (!routes) routes = require('./default-routes').default(config.components)
  // each route needs to be unambiguous
  const preparedRoutes = routes.map(route => ({ ...route, exact: true }))
  // add the a default 404 route
  preparedRoutes.push({
    path: '(.*)',
    notFoundRoute: true,
    component: buildErrorView({
      config,
      missing: false
    })
  })
  return preparedRoutes
}
