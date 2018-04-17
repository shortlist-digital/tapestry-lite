import idx from 'idx'
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
      let fetchRequestHasErrored = false

      // Set a flag for whether we have a missing component later on
      const routeComponentUndefined = typeof route.component === 'undefined'
      // Does the fetch we are about to perform allow an empty response
      // from WordPress? If it doesn't, then we will override WP's 200
      // with a 404
      const allowEmptyResponse = idx(route, _ => _.options.allowEmptyResponse)
      // If we have an endpoint
      if (route.endpoint) {
        // Start to try and fetch data
        try {
          const multidata = await fetchFromEndpointConfig({
            endpointConfig: route.endpoint,
            baseUrl: baseUrlResolver(config, request.url),
            requestUrlObject: request.url,
            params: match.params,
            allowEmptyResponse
          })
          // log.silly(
          //   `HTML: Result from ${chalk.green('fetchFromEndpointConfig')}`,
          //   multidata
          // )
          // If we received data without throwing - normalize it
          componentData = normalizeApiResponse(multidata, route)
          log.silly(
            `Endpoint (${chalk.green(route.endpoint)}) fetched and normalized:`,
            componentData
          )
        } catch (e) {
          // There has eiter been a 'natural 404', or we've thrown one
          // due to an empty response from a WP endpoint
          componentData = e
          fetchRequestHasErrored = true
          log.error(
            `Endpoint (${chalk.green(route.endpoint)}) failed to fetch:`,
            componentData
          )
        } // End of fetching 'try' block
      } // End of 'if endpoint' block
      // We now have componentData
      // If there's no component, and have a 4xx or 5xx error - and
      // an empty response is not allowed, we replace the route component
      // with our error view component
      if (
        componentData.code === 404 ||
        routeComponentUndefined ||
        (fetchRequestHasErrored && !allowEmptyResponse)
      ) {
        log.debug(`Render Error component`, {
          routeComponentUndefined,
          fetchRequestHasErrored,
          allowEmptyResponse
        })
        route.component = buildErrorView({
          config,
          missing: routeComponentUndefined
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
      }

      // Render the route with componentData, the route
      const responseString = await renderTreeToHTML({
        route,
        match,
        componentData
      })

      // Set status code
      const code = componentData.code || 200
      if (code == 200) {
        log.debug(`Set HTML in cache ${chalk.green(cacheKey)}`)
        cache.set(cacheKey, responseString)
      }
      log.silly('Rendering HTML from scratch', responseString)
      // Respond with new Hapi 17 api
      return h
        .response(responseString)
        .type('text/html')
        .code(code)
    }
  })
}
