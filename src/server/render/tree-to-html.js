import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { getLoadableState } from 'loadable-components/server'
import Helmet from 'react-helmet'

export default async ({
  Component,
  routeOptions = {},
  match,
  componentData,
  queryParams,
  config
}) => {
  const _tapestryData = {
    requestData: {
      ...match,
      queryParams
    }
  }
  // create html string from target component
  const Route = () => <Component {...componentData} _tapestry={_tapestryData} />
  const App = config.components && config.components.App

  const toRender = App ? (
    <App>
      <Route />
    </App>
  ) : (
    <Route />
  )
  // getLoadableState must be called before renderToString to preload all import() components
  const loadableState = await getLoadableState(toRender)
  const htmlString = renderToString(toRender)
  // { html, css, ids }
  let styleData = {}
  // extract html, css and ids from either Glamor or Emotion
  if (process.env.CSS_PLUGIN === 'emotion') {
    styleData = require('emotion-server').extractCritical(htmlString)
  } else {
    styleData = require('glamor/server').renderStaticOptimized(() => htmlString)
  }
  const helmet = Helmet.renderStatic()
  // Assets to come, everything else works
  const renderData = {
    ...styleData,
    head: helmet,
    bootstrapData: componentData,
    _tapestryData,
    loadableState
  }
  let Document =
    routeOptions.customDocument || require('../render/default-document').default
  return `${
    routeOptions.disableDoctype ? '' : '<!doctype html>'
  }${renderToStaticMarkup(<Document {...renderData} />)}`
}
