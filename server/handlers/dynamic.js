import React from 'react'
import { matchRoutes } from 'react-router-config'
import renderHtml from '../render'
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
      const body = await data.json()
      const App = () =>
        <route.component {...body} />
      let context = {}
      const response = renderHtml(App)
      return h
        .response(response)
        .type('text/html')
        .code(200) 
    }
  })
}

