import React from 'react'
import { hydrate } from 'react-dom'
import { matchRoutes } from 'react-router-config'
import config from 'tapestry.config.js'
import prepareAppRoutes from '../server/routing/prepare-app-routes'

const renderApp = config => {
  // define routes/history for react-router
  const routes = prepareAppRoutes(config)
  const targetNode = document.getElementById('root')
  
  const branch = matchRoutes(routes, request.url.pathname)
  const route = branch[0].routes
  const match = branch[0].match
  hydrate(
    <route.component {...match} {...window.__BOOTSTRAP__INIT__} />,
    targetNode
  )
}

renderApp(config)

if (module.hot) {
  module.hot.accept('tapestry.config.js', () => {
    const newConfig = require('tapestry.config.js').default
    renderApp(newConfig)
  })
}

