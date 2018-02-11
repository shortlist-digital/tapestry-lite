import React from 'react'
import { matchRoutes } from 'react-router-config'
import { renderStaticOptimized } from 'glamor/server'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import Helmet from 'react-helmet'

import renderHtml from '../render'
import Document from '../render/default-document'
import appConfig from '../../test-app/tapestry.config'
import fetcher from '../../shared/fetcher'

export default ({ server }) => {
  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: async function (request, h) {
      const branch = matchRoutes(appConfig.routes, request.url.pathname)
      // Make this more robust
      const route = branch[0].route
      // Steal the endpoint data resolver and normalisation bits
      // from normal tapestry
      const endpoint = route.endpoint(branch[0].match.params)
      const url = `${appConfig.siteUrl}/wp-json/wp/v2/${endpoint}`
      const responseBody= await fetcher(url)
      const data = await responseBody.json()
      const { html, css, ids } = renderStaticOptimized(() =>
        renderToString(<route.component {...data} />))
      const renderData = {
        html,
        css,
        ids,
        head: Helmet.rewind(),
        bootstrapData: data
      }
      const responseString = renderToStaticMarkup(<Document {...renderData} />)
      return h
        .response(responseString)
        .type('text/html')
        .code(200) 
    }
  })
}

