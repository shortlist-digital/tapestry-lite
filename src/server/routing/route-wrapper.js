import React from 'react'
import { Route } from 'react-router'
import HTTPStatus from 'http-status'
import defaultRoutes from './default-routes'
import buildErrorView from '../render/error-view'

const RouteWrapper = config => {
  // if user routes have been defined, take those in preference to the defaults
  const routes = config.routes || defaultRoutes(config.components)
  let routesWithExact = routes.map(route => {
    return {
      ...route,
      exact: true
    }
  })
  // Add the a default 404 route
  routesWithExact.push({
    path: '/*',
    notFoundRoute: true,
    component: buildErrorView({
      config,
      missing: false
    })
  })
  return routesWithExact
}

export default RouteWrapper
