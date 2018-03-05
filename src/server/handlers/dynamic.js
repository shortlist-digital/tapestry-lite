import React from 'react'
import { matchRoutes } from 'react-router-config'
import { renderStaticOptimized } from 'glamor/server'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import Helmet from 'react-helmet'

// Same default document
import Document from '../render/default-document'
// Using an old dummy app I have for now
import appConfig from '../../../test-app/tapestry.config'
// Tuned fetched from normal tapestry
import fetcher from '../../shared/fetcher'

export default ({ server }) => {
  console.log('server in dynamic', { server })
  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: async function (request, h) {
      // Don't even import react-router any more, but backwards compatible
      // With the exception of optional params: (:thing) becomes :thing?
      const branch = matchRoutes(appConfig.routes, request.url.pathname)
      // Make this more robust
      const route = branch[0].route
      // Steal the endpoint data resolver and normalisation bits
      // from normal tapestry
      const endpoint = route.endpoint(branch[0].match.params)
      const url = `${appConfig.siteUrl}/wp-json/wp/v2/${endpoint}`
      // Async/Await dereams
      const responseBody= await fetcher(url)
      const data = await responseBody.json()
      // Glamor works as before
      const { html, css, ids } = renderStaticOptimized(() =>
        renderToString(<route.component {...data} />))
      // Assets to come, everything else works
      const renderData = {
        html,
        css,
        ids,
        head: Helmet.rewind(),
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
