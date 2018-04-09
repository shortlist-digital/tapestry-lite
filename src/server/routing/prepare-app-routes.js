import defaultRoutes from './default-routes'
import buildErrorView from '../render/error-view'

export default config => {
  // if user routes have been defined, take those in preference to the defaults
  const routes = config.routes || defaultRoutes(config.components)
  let preparedRoutes = routes.map(route => {
    return {
      ...route,
      exact: true
    }
  })
  // Add the a default 404 route
  preparedRoutes.push({
    notFoundRoute: true,
    component: buildErrorView({
      config,
      missing: false
    })
  })

  return preparedRoutes
}
