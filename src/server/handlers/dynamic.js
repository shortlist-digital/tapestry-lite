import React from 'react'
import { matchRoutes } from 'react-router-config'
import { renderStaticOptimized } from 'glamor/server'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import Helmet from 'react-helmet'
import RouteWrapper from '../routing/route-wrapper'
import idx from 'idx'
// Tuned fetched from normal tapestry
import apiFetch from '../data-fetching/api-fetch'
import normalizeApiResponse from '../data-fetching/normalize-api-response'
import fetchFromEndpointConfig from '../data-fetching/fetch-from-endpoint-config'
import baseUrlResolver from '../utilities/base-url-resolver'
import { log } from '../utilities/logger'
import buildErrorView from '../render/error-view'

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
      let route, match, componentData, data, errorData, allowEmptyResponse
      // If there's a branch of the route config, we have a route
      if (branch[0]) {
        // Make this more robust
        // Assign the route object
        route = branch[0].route
        // Assign the match object for the route
        // https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/match.md
        match = branch[0].match
        // Steal the endpoint data resolver and normalisation bits
        // from normal tapestry
        // Setup a default ocomponent
        data = false
        let errorData = false
        if (route.endpoint) {
          // Async/Await dereams
          allowEmptyResponse = idx(route, _ => _.options.allowEmptyResponse)
          try {
            const multidata = await fetchFromEndpointConfig({
              endpointConfig: route.endpoint,
              baseUrl: baseUrlResolver(config),
              requestUrlObject: request.url,
              params: match.params,
              allowEmptyResponse
            })
            data = normalizeApiResponse(multidata, route)
          } catch (e) {
            log.error(e)
            errorData = e
          }
        }
        const missing = (typeof route.component === 'undefined')
        componentData = errorData || data
        if (missing || (errorData && !allowEmptyResponse)) {
          route.component = buildErrorView({config, missing})
        }
      } else {
        route = {
          component: buildErrorView({config, missing: false})
        }
        componentData = {
          message: 'Not Found',
          code: 404
        }
      }
      // Glamor works as before
      const { html, css, ids } = renderStaticOptimized(() =>
        renderToString(<route.component {...match} {...componentData} />)
      )
      const helmet = Helmet.renderStatic()
      // Assets to come, everything else works
      const renderData = {
        html,
        css,
        ids,
        head: helmet,
        bootstrapData: data
      }
      let Document = idx(route, _ => _.options.customDocument) || require('../render/default-document').default
      const responseString = renderToStaticMarkup(<Document {...renderData} />)
      // Respond with new Hapi 17 api
      return h
        .response(responseString)
        .type('text/html')
        .code(componentData.code || 200)
    }
  })
}
