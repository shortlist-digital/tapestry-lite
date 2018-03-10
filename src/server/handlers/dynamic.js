import React from 'react'
import { matchRoutes } from 'react-router-config'
import { renderStaticOptimized } from 'glamor/server'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import Helmet from 'react-helmet'
import RouteWrapper from '../route-wrapper'
import idx from 'idx'
// Tuned fetched from normal tapestry
import AFAR from '../../server/api-fetch-and-respond'
import baseUrlResolver from '../../utilities/base-url-resolver'

export default ({ server, config }) => {
  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: async function(request, h) {
      // Don't even import react-router any more, but backwards compatible
      // With the exception of optional params: (:thing) becomes :thing?
      const routes = RouteWrapper(config)
      const branch = matchRoutes(routes, request.url.pathname)
      if (!branch.length) {
        console.log(request.url)
        console.error('No paths matched: ', config.routes)
        console.log({message: 'No routes matched'})
        return h.response('Not found').code(404)
      }
      // Make this more robust
      const { route, match } = branch[0]
      // Steal the endpoint data resolver and normalisation bits
      // from normal tapestry
      const endpoint = route.endpoint && route.endpoint(match.params)

      let data = false
      if (endpoint) {
        const url = `${baseUrlResolver(config)}/${endpoint}`
        console.log({requestUrl: url})
        // Async/Await dereams

        try {
          const data = await AFAR(url)
        } catch (e) {
          console.log('Throwing error in dynamic fetch')
          console.error(e)
          return h.response('Not Found').code(404)
        }
      }
      // Glamor works as before
      const { html, css, ids } = renderStaticOptimized(() =>
        renderToString(<route.component {...match} {...data} />)
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
        .code(200)
    }
  })
}
