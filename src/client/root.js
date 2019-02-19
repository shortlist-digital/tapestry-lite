import React from 'react'
import { hot } from 'react-hot-loader'

import prepareAppRoutes from '../server/routing/prepare-app-routes'
import buildErrorView from '../server/render/error-view'

const log = (msg, data) =>
  window.location.hash.indexOf('development') !== -1 && console.log(msg, data)

const Root = config => {
  log(`Application data`, window.__TAPESTRY_DATA__)

  if (window.__TAPESTRY_DATA__.appData.status > 299) {
    const Component = buildErrorView({ config, missing: false })
    return <Component {...window.__TAPESTRY_DATA__.appData} />
  }

  const routes = prepareAppRoutes(config)
  const path = window.__TAPESTRY_DATA__._tapestry.requestData.path

  // We will only ever return the first route, even if multiple are matched
  const Component = routes.filter(route => route.path === path)[0].component

  return (
    <Component
      {...window.__TAPESTRY_DATA__.appData}
      _tapestry={window.__TAPESTRY_DATA__._tapestry}
    />
  )
}

export default hot(module)(Root)
