import React, { Fragment } from 'react'
import { Route } from 'react-router'

import defaultRoutes from './default-routes'

const RouteWrapper = config => {
  // if user routes have been defined, take those in preference to the defaults
  const routes = config.routes || defaultRoutes(config.components)
  const ErrorComponent = () =>
    <h1>Error</h1>
  // loops over routes and return react-router <Route /> components
  return (
    <Fragment>
      {routes.map(route => {
        // return individual route
        console.log(route.path)
        return (
          <Route
            key={route.path}
            component={route.component}
            exaxt
            path={route.path}
          />
        )
      })}
      <Route path="*" component={ErrorComponent} />
    </Fragment>
  )
}

export default RouteWrapper
