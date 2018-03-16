import React from 'react'
import { matchRoutes } from 'react-router-config'
import prepareAppRoutes from '../server/routing/prepare-app-routes'
import { hot } from 'react-hot-loader'

const Root = (config) => {
  const routes = prepareAppRoutes(config)
  const { route, match } = matchRoutes(routes, window.location.pathname)[0]
  const componentData = window.__BOOTSTRAP_DATA__
  return <route.component {...match} {...componentData} />
}

export default hot(module)(Root)


