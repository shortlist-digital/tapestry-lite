import chalk from 'chalk'

import prepareAppRoutes from '../routing/prepare-app-routes'
import matchRoutes from '../routing/match-routes'

import normalizeApiResponse from '../data-fetching/normalize-api-response'
import fetchFromEndpointConfig from '../data-fetching/fetch-from-endpoint-config'
import buildErrorView from './error-view'
import renderSuccessTree from './render-success-tree'
import renderErrorTree from './render-error-tree'

import baseUrlResolver from '../utilities/base-url-resolver'
import { log } from '../utilities/logger'

const errorResponse = async ({ config, route, match }) => {
  log.debug(`Render Error component`)

  const Component = buildErrorView({
    config,
    missing: typeof route.component === 'undefined'
  })
  const responseString = await renderErrorTree({
    Component,
    route,
    match,
    componentData: {
      status: 404,
      statusText: 'Not Found'
    }
  })
  return {
    responseString,
    status: 404
  }
}

export default async (requestPath, requestQuery, config) => {
  const routes = prepareAppRoutes(config)
  const { route, match } = matchRoutes(routes, requestPath)
  let componentData = {}

  log.debug(`Matched route ${chalk.green(route.path)}`)

  // requested error
  if (route.error) {
    return errorResponse({ config, route, match })
  }

  // request data if needed
  if (route.endpoint) {
    const data = await fetchFromEndpointConfig({
      endpointConfig: route.endpoint,
      baseUrl: baseUrlResolver(config, requestQuery),
      params: match.params,
      requestQuery
    })
    componentData = normalizeApiResponse(data, route)
  }
  // not found route
  if (route.notFoundRoute || componentData.status > 299) {
    return errorResponse({ config, route, match })
  }
  // successful route
  const responseString = await renderSuccessTree({
    route,
    match,
    componentData,
    requestQuery
  })

  return {
    responseString,
    status: 200
  }
}
