import React from 'react'
import { matchRoutes } from 'react-router-config'
import { renderStaticOptimized } from 'glamor/server'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import Helmet from 'react-helmet'
import RouteWrapper from '../route-wrapper'
import idx from 'idx'
// Tuned fetched from normal tapestry
import AFAR from '../../server/api-fetch-and-respond'
import fetcher from '../../shared/fetcher'
import baseUrlResolver from '../../utilities/base-url-resolver'
import { log } from '../../utilities/logger'
import buildErrorView from '../render/error-view'

export default ({ server, config }) => {
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
      const routes = RouteWrapper(config)
      const branch = matchRoutes(routes, request.url.pathname)
      let route, match, componentData, data, errorData
      if (branch[0]) {
        // Make this more robust
        route = branch[0].route
        match = branch[0].match
        // Steal the endpoint data resolver and normalisation bits
        // from normal tapestry
        const endpoint = route.endpoint && route.endpoint(match.params)
        // Setup a default ocomponent

        data = false
        let errorData = false
        if (endpoint) {
          const url = `${baseUrlResolver(config)}/${endpoint}`
          // Async/Await dereams
          const allowEmptyResponse = idx(route, _ => _.options.allowEmptyResponse)

          try {
            data = await AFAR(url, allowEmptyResponse)
          } catch (e) {
            log.error(e)
            errorData = e
          }
        }
        const missing = (typeof route.component === 'undefined')
        componentData = errorData || data
        if (errorData && !allowEmptyResponse) {
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
      console.log({route})
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
