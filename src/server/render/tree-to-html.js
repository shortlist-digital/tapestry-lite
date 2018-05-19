import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { getLoadableState } from 'loadable-components/server'
import Helmet from 'react-helmet'

export default async ({
  Component,
  routeOptions = {},
  match,
  componentData
}) => {
  const htmlString = renderToString(<Component {...match} {...componentData} />)
  // { html, css, ids }
  let styleData = {}
  // extract CSS from either Glamor or Emotion
  if (process.env.CSS_PLUGIN === 'emotion') {
    styleData = require('emotion-server').extractCritical(htmlString)
  } else {
    styleData = require('glamor/server').renderStaticOptimized(() => htmlString)
  }
  const helmet = Helmet.renderStatic()
  const loadableState = await getLoadableState(
    <Component {...match} {...componentData} />
  )
  // Assets to come, everything else works
  const renderData = {
    ...styleData,
    head: helmet,
    bootstrapData: componentData,
    loadableState
  }
  let Document =
    routeOptions.customDocument || require('../render/default-document').default
  return `<!doctype html>${renderToStaticMarkup(<Document {...renderData} />)}`
}
