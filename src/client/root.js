import React from 'react'
import { hot } from 'react-hot-loader'

import prepareAppRoutes from '../server/routing/prepare-app-routes'
import matchRoutes from '../server/routing/match-routes'
import buildErrorView from '../server/render/error-view'

const log = (msg, data) =>
  window.location.hash.indexOf('development') !== -1 && console.log(msg, data)

const Root = config => {
  log(`Application data`, window.__TAPESTRY_DATA__)
  if (window.__TAPESTRY_DATA__.appData.code === 404) {
    const Component = buildErrorView({ config, missing: false })
    return <Component {...window.__TAPESTRY_DATA__.appData} />
  }
  const { route, match } = matchRoutes(
    prepareAppRoutes(config),
    window.location.pathname
  )
  log('Matched route', { route, match })
  return <route.component {...match} {...window.__TAPESTRY_DATA__.appData} />
}

export default hot(module)(Root)
