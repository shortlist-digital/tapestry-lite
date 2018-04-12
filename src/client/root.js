import React from 'react'
import { hot } from 'react-hot-loader'

import prepareAppRoutes from '../server/routing/prepare-app-routes'
import matchRoutes from '../server/routing/match-routes'
import buildErrorView from '../server/render/error-view'

const Root = config => {
  if (window.__data.appData.code === 404) {
    const Component = buildErrorView({ config, missing: false })
    return <Component {...window.__data.appData} />
  }
  console.log(`Application data`, window.__data)
  const { route, match } = matchRoutes(
    prepareAppRoutes(config),
    window.location.pathname
  )
  console.log('Matched route', route)
  return <route.component {...match} {...window.__data.appData} />
}

export default hot(module)(Root)
