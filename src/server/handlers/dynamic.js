import { matchRoutes } from 'react-router-config'
import idx from 'idx'

import baseUrlResolver from '../utilities/base-url-resolver'
import { log } from '../utilities/logger'
import CacheManager from '../utilities/cache-manager'

import prepareAppRoutes from '../routing/prepare-app-routes'

import normalizeApiResponse from '../data-fetching/normalize-api-response'
import fetchFromEndpointConfig from '../data-fetching/fetch-from-endpoint-config'

import buildErrorView from '../render/error-view'
import renderTreeToHTML from '../render/tree-to-html'

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
    handler: async function(request, h) {
      // Set a cache key
      const cacheKey = request.url.pathname || '/'
      // Is there cached HTML?
      const cachedHTML = await cache.get(cacheKey)
      // If there's a cache response, return the response straight away
      if (cachedHTML) {
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
      const branch = matchRoutes(routes, request.url.pathname)
      // This needs tidying
      let route, match, componentData
      let fetchRequestHasErrored = false
      // If there's a branch of the route config, we have a route
      if (branch[0]) {
        // Optimistic default component data for static routes
        componentData = {
          status: 200,
          message: '200'
        }
        // Assign the route object
        route = branch[0].route
        // Assign the match object for the route
        // https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/match.md
        match = branch[0].match
        // Set a flag for whether we have a missing component later on
        const routeComponentUndefined = typeof route.component === 'undefined'
        // Does the fetch we are about to perform allow an empty response from WordPress?
        // If it doesn't, then we will override WP's 200 with a 404
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
            // If we received data without throwing - normalize it
            componentData = normalizeApiResponse(multidata, route)
          } catch (e) {
            // There has eiter been a 'natural 404', or we've thrown one
            // due to an empty response from a WP endpoint
            log.error(e)
            componentData = e
            fetchRequestHasErrored = true
          } // End of fetching 'try' block
        } // End of 'if endpoint' block
        // We now have componentData
        // If there's no component, and have a 4xx or 5xx error - and
        // an empty response is not allowed, we replace the route component
        // with our error view component
        if (
          routeComponentUndefined ||
          (fetchRequestHasErrored && !allowEmptyResponse)
        ) {
          route.component = buildErrorView({
            config,
            missing: routeComponentUndefined
          })
        }
      }
      // If our route is the not found route
      // Overwrite the data
      if (route.notFoundRoute) {
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
        cache.set(cacheKey, responseString)
      }
      // Respond with new Hapi 17 api
      return h
        .response(responseString)
        .type('text/html')
        .code(code)
    }
  })
}
