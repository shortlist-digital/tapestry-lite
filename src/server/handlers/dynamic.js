import React from 'react'
import { matchRoutes } from 'react-router-config'
import { renderStaticOptimized } from 'glamor/server'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import Helmet from 'react-helmet'
import RouteWrapper from '../routing/route-wrapper'
import idx from 'idx'
// Tuned fetched from normal tapestry
import normalizeApiResponse from '../data-fetching/normalize-api-response'
import fetchFromEndpointConfig from '../data-fetching/fetch-from-endpoint-config'
import baseUrlResolver from '../utilities/base-url-resolver'
import { log } from '../utilities/logger'
import buildErrorView from '../render/error-view'
import renderTreeToHTML from '../render/tree-to-html'

export default ({ server, config }) => {
  // Build App Routes
  const routes = RouteWrapper(config)

  server.route({
    config: {
      cache: {
        expiresIn:
          (parseInt(process.env.CACHE_CONTROL_MAX_AGE, 10) || 0) * 1000, // 1 Minute
        privacy: 'public'
      }
    },
    method: 'GET',
    path: '/{path*}',
    handler: async function(request, h) {
      // Don't even import react-router any more, but backwards compatible
      // With the exception of optional params: (:thing) becomes :thing?
      // Match Routes
      // this should only have one route as we force "exact" on each route
      // How would we error out if two routes match here? "Ambigous routes detected?" maybe earlier in app
      const branch = matchRoutes(routes, request.url.pathname)
      // This needs tidying
      let route, match
      // Optimistic default component data for static routes
      let componentData = {
        status: 200,
        message: '200'
      }
      let fetchRequestHasErrored = false
      // If there's a branch of the route config, we have a route
      if (branch[0]) {
        // Assign the route object
        route = branch[0].route
        // Assign the match object for the route
        // https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/match.md
        match = branch[0].match
        // Set a flag for whether we have a missing component later on
        const routeComponentUndefined  = (typeof route.component === 'undefined')
        // Does the fetch we are about to perform allow an empty response from WordPress?
        // If it doesn't, then we will override WP's 200 with a 404
        const allowEmptyResponse = idx(route, _ => _.options.allowEmptyResponse)
        // If we have an endpoint
        if (route.endpoint) {
          // Start to try and fetch data 
          try {
            const multidata = await fetchFromEndpointConfig({
              endpointConfig: route.endpoint,
              baseUrl: baseUrlResolver(config),
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
        if (routeComponentUndefined || (fetchRequestHasErrored && !allowEmptyResponse)) {
          route.component = buildErrorView({config, missing: routeComponentUndefined})
        }
      } else { // end of route match block
        // No routes match, so we kick off rendering a 404 page
        // Create a fake route object with an error view,
        // and add componentData with 404 status and message
        route = {
          component: buildErrorView({config, missing: false})
        }
        componentData = {
          message: 'Not Found',
          code: 404
        }
      }

      // Render the route with componentData, the route
      const responseString = renderTreeToHTML({
        route,
        match,
        componentData
      })

      // Respond with new Hapi 17 api
      return h
        .response(responseString)
        .type('text/html')
        .code(componentData.code || 200)
    }
  })
}
