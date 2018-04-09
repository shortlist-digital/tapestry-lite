import React from 'react'
import { hot } from 'react-hot-loader'

import prepareAppRoutes from '../server/routing/prepare-app-routes'
import buildErrorView from '../server/render/error-view'
import matchRoutes from '../server/utilities/match-routes'

const Root = config => {
  if (window.__data.appData.code === 404) {
    const Component = buildErrorView({ config, missing: false })
    return <Component {...window.__data.appData} />
  }
  const routes = prepareAppRoutes(config)
  const { route, match } = matchRoutes(routes, window.location.pathname)[0]
  console.log({ route, match })
  return <route.component {...match} {...window.__data.appData} />
}

export default hot(module)(Root)
