import React from 'react'
import { Route } from 'react-router'
import HTTPStatus from 'http-status'

import defaultRoutes from './default-routes'

const RouteWrapper = config => {
  // if user routes have been defined, take those in preference to the defaults
  return config.routes || defaultRoutes(config.components)
}

export default RouteWrapper
