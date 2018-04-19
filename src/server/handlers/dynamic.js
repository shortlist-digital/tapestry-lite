import chalk from 'chalk'

import prepareAppRoutes from '../routing/prepare-app-routes'
import matchRoutes from '../routing/match-routes'

import normalizeApiResponse from '../data-fetching/normalize-api-response'
import fetchFromEndpointConfig from '../data-fetching/fetch-from-endpoint-config'

import buildErrorView from '../render/error-view'
import renderTreeToHTML from '../render/tree-to-html'

import baseUrlResolver from '../utilities/base-url-resolver'
import CacheManager from '../utilities/cache-manager'
import { log } from '../utilities/logger'

const renderErrorTree = async ({ route, match, componentData, h }) => {
  log.silly('Rendering Error HTML')
  const responseString = await renderTreeToHTML({
    route,
    match,
    componentData
  })
  log.silly('Error Data: ', componentData)
  return h
    .response(responseString)
    .type('text/html')
    .code(componentData.code || 404)
}

const renderSuccessTree = async ({ route, match, componentData, h }) => {
  log.silly('Rendering Success HTML', { match })
  const responseString = await renderTreeToHTML({
    route,
    match,
    componentData
  })
  return h
    .response(responseString)
    .type('text/html')
    .code(200)
}

export default ({ server, config }) => {
  let cacheManager = new CacheManager()
  const cache = cacheManager.createCache('html')
  const routes = prepareAppRoutes(config)

  server.route({
    options: {
      cache: {
        expiresIn:
          (parseInt(process.env.CACHE_CONTROL_MAX_AGE, 10) || 0) * 1000, // 1 Minute
        privacy: 'public'
      }
    },
    method: 'GET',
    path: '/{path*}',
    handler: async (request, h) => {
      // Set a cache key
      const cacheKey = request.url.pathname || '/'
      // Is there cached HTML?
      const cachedHTML = await cache.get(cacheKey)
      // If there's a cache response, return the response straight away
      if (cachedHTML) {
        log.debug(`Rendering HTML from cache: ${chalk.green(cacheKey)}`)
        return h
          .response(cachedHTML)
          .type('text/html')
          .code(200)
      }

      // Don't even import react-router any more, but backwards compatible
      // With the exception of optional params: (:thing) becomes :thing?
      // Match Routes
      // this should only have one route as we force "exact" on each route
      // How would we error out if two routes match here? "Ambigous routes detected?" maybe earlier in app
      const { route, match } = matchRoutes(routes, request.url.pathname)

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
          baseUrl: baseUrlResolver(config, request.url),
          requestUrlObject: request.url,
          params: match.params
        })
        componentData = normalizeApiResponse(multidata, route)
      }
      if (componentData.code > 299 || routeComponentUndefined) {
        log.debug(`Render Error component`, {
          componentData,
          routeComponentUndefined
        })

        route.component = buildErrorView({
          config,
          missing: routeComponentUndefined
        })
        return renderErrorTree({
          route,
          match,
          componentData,
          h
        })
      }

      // If our route is the not found route
      // Overwrite the data
      if (route.notFoundRoute) {
        log.debug('Route is "not found" route')
        componentData = {
          message: 'Not Found',
          code: 404
        }
        return renderErrorTree({
          route,
          match,
          componentData,
          h
        })
      }

      return renderSuccessTree({
        route,
        match,
        componentData,
        h
      })
    }
  })
}
