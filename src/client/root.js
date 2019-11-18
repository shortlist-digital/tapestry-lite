import { hot } from 'react-hot-loader/root'
import React from 'react'

import prepareAppRoutes from '../server/routing/prepare-app-routes'
import buildErrorView from '../server/render/error-view'

const log = (msg, data) =>
  window.location.hash.indexOf('development') !== -1 && console.log(msg, data)

const Root = config => {
  log(`Application data`, window.__TAPESTRY_DATA__)

  const { appData, _tapestry } = window.__TAPESTRY_DATA__
  const props = Array.isArray(appData) ? { data: appData } : appData

  console.log({ appData })

  const Component =
    appData.code === 404
      ? buildErrorView({ config, missing: false })
      : prepareAppRoutes(config).filter(
          route => route.path === _tapestry.requestData.path
        )[0].component

  console.log({ Component })

  return <Component {...props} _tapestry={_tapestry} />
}

export default hot(Root)
