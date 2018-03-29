import React from 'react'
import { hot } from 'react-hot-loader'
import { matchRoutes } from 'react-router-config'

import prepareAppRoutes from '../server/routing/prepare-app-routes'
import buildErrorView from '../server/render/error-view'

const Root = (config) => {
  if (window.__data.appData.code === 404) {
    const Component = buildErrorView({ config, missing: false })
    return <Component {...window.__data.appData} />
  }
  const routes = prepareAppRoutes(config)
  const { route, match } = matchRoutes(routes, window.location.pathname)[0]
  return <route.component {...match} {...window.__data.appData} />
}

export default hot(module)(Root)


