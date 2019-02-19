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

const errorResponse = async ({ config, route, match, missing = false }) => {
  log.debug('Render Error component')

  const errorComponent = buildErrorView({ config, missing })

  const responseString = await renderErrorTree({
    errorComponent,
    route,
    match,
    componentData: {
      code: 404,
      message: 'Not Found'
    }
  })
  return {
    responseString,
    status: 404
  }
}

export default async (requestPath, requestQuery, config) => {
  // get matching route and match data
  const { route, match } = matchRoutes(prepareAppRoutes(config), requestPath)
  let componentData = {}

  log.debug(`Matched route ${chalk.green(route.path)}`)

  // route has requested an error response
  // route hasn't configured a component
  if (route.error || typeof route.component === 'undefined') {
    log.silly('Render Error component', { route, match })
    return errorResponse({ config, route, match, missing: true })
  }

  // endpoint has been specified, data requested
  if (route.endpoint) {
    const data = await fetchFromEndpointConfig({
      endpointConfig: route.endpoint,
      baseUrl: baseUrlResolver(config, requestQuery),
      params: match.params,
      queryParams: requestQuery
    })
    componentData = normalizeApiResponse(data, route)
  }

  // route hasn't got a match from config.routes
  // status from API response is not OK
  // API returns empty response
  if (
    route.notFoundRoute ||
    componentData.code > 299 ||
    (route.endpoint && isEmpty(componentData.data || componentData))
  ) {
    log.silly('Render Error component', { route, match, componentData })
    return errorResponse({ config, route, match })
  }

  // otherwise build component tree with API data
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
