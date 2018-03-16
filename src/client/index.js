import React from 'react'
import { hydrate } from 'react-dom'
import { matchRoutes } from 'react-router-config'
import config from 'tapestry.config.js'
import prepareAppRoutes from '../server/routing/prepare-app-routes'

const renderApp = config => {
  // define routes/history for react-router
  const routes = prepareAppRoutes(config)
  const targetNode = document.getElementById('root')
  console.log(targetNode)

  const { route, match } = matchRoutes(routes, window.location.pathname)[0]

  console.log({ route, match })

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
