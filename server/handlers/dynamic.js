import React from 'react'
import { matchRoutes } from 'react-router-config'
import { renderStatic } from 'glamor/server'
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
      const route = branch[0].route
      const endpoint = route.endpoint(branch[0].match.params)
      const url = `${appConfig.siteUrl}/wp-json/wp/v2/${endpoint}`
      const data = await fetcher(url)
      const responseBody = await data.json()
      const App = () =>
        <route.component {...responseBody} />
      const { html, css, ids } = renderStatic(() =>
        renderToString(<route.component {...responseBody} />))

      const renderData = {
        html,
        css,
        ids,
        head: Helmet.rewind(),
        bootstrapData: responseBody
      }

      const responseString = `<!doctype html>${renderToStaticMarkup(<Document {...renderData} />)}`
      return h
        .response(responseString)
        .type('text/html')
        .code(200) 
    }
  })
}

