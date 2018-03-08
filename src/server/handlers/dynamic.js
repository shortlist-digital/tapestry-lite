import React from 'react'
import { matchRoutes } from 'react-router-config'
import { renderStaticOptimized } from 'glamor/server'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import Helmet from 'react-helmet'
import RouteWrapper from '../route-wrapper'

// Same default document
import Document from '../render/default-document'
// Using an old dummy app I have for now
// Tuned fetched from normal tapestry
import fetcher from '../../shared/fetcher'

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
        console.error('No paths matched: ', config.routes)
        throw new Error({message: 'No routes matched'})
      }
      // Make this more robust
      const route = branch[0].route
      // Steal the endpoint data resolver and normalisation bits
      // from normal tapestry
      const endpoint = route.endpoint && route.endpoint(branch[0].match.params)

      let data = false
      if (endpoint) {
        const url = `${config.siteUrl}/wp-json/wp/v2/${endpoint}`
        // Async/Await dereams

        try {
          const responseBody = await fetcher(url)
          data = await responseBody.json()
        } catch (e) {
          console.error(e)
          process.exit(1)
        }
      }
      // Glamor works as before
      const { html, css, ids } = renderStaticOptimized(() =>
        renderToString(<route.component {...data} />)
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
      const responseString = renderToStaticMarkup(<Document {...renderData} />)
      // Respond with new Hapi 17 api
      return h
        .response(responseString)
        .type('text/html')
        .code(200)
    }
  })
}
