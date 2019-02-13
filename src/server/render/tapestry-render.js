import chalk from 'chalk'
import isEmpty from 'lodash.isempty'

import prepareAppRoutes from '../routing/prepare-app-routes'
import matchRoutes from '../routing/match-routes'

import normalizeApiResponse from '../data-fetching/normalize-api-response'
import fetchFromEndpointConfig from '../data-fetching/fetch-from-endpoint-config'
import buildErrorView from './error-view'
import renderSuccessTree from './render-success-tree'
import renderErrorTree from './render-error-tree'

import baseUrlResolver from '../utilities/base-url-resolver'
import { log } from '../utilities/logger'

export default async (requestPath, requestQuery, config) => {
  // Don't even import react-router any more, but backwards compatible
  // With the exception of optional params: (:thing) becomes :thing?
  // Match Routes
  // this should only have one route as we force "exact" on each route
  // How would we error out if two routes match here? "Ambigous routes detected?" maybe earlier in app
  const routes = prepareAppRoutes(config)
  const { route, match } = matchRoutes(routes, requestPath)
  log.debug(`Matched route ${chalk.green(route.path)}`)
  // This needs tidying
  // If there's a branch of the route config, we have a route
  // Optimistic default component data for static routes
  let componentData = {
    status: 200,
    message: '200'
  }

  // Set a flag for whether we have a missing component later on
  const routeComponentUndefined = typeof route.component === 'undefined'
  // If we have an endpoint
  if (route.endpoint) {
    // Start to try and fetch data
    const multidata = await fetchFromEndpointConfig({
      endpointConfig: route.endpoint,
      baseUrl: baseUrlResolver(config, requestQuery),
      params: match.params,
      queryParams: requestQuery
    })
    componentData = normalizeApiResponse(multidata, route)
  }
  if (componentData.code > 299 || routeComponentUndefined) {
    log.debug(`Render Error component`, {
      componentData,
      routeComponentUndefined
    })

    const errorComponent = buildErrorView({
      config,
      missing: routeComponentUndefined
    })

    const responseString = await renderErrorTree({
      errorComponent,
      route,
      match,
      componentData
    })

    return {
      responseString,
      status: componentData.status || 404
    }
  }

  // If our route is the not found route
  // Overwrite the data
  const loadedData = componentData.data || componentData
  if (route.notFoundRoute || (route.endpoint && isEmpty(loadedData))) {
    log.silly(
      'Route is "not found" route',
      route.endpoint,
      isEmpty(loadedData),
      componentData,
      route.notFoundRoute
    )
    componentData = {
      message: 'Not Found',
      code: 404
    }
    const errorComponent = buildErrorView({
      config,
      missing: routeComponentUndefined
    })
    const responseString = await renderErrorTree({
      errorComponent,
      route,
      match,
      componentData
    })

    return {
      responseString,
      status: componentData.status || 404
    }
  }

  const responseString = await renderSuccessTree({
    route,
    match,
    componentData,
    queryParams: requestQuery
  })

  return {
    responseString,
    status: 200
  }
}
