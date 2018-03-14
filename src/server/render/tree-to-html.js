import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import Helmet from 'react-helmet'
import idx from 'idx'

export default ({ route, match, componentData }) => {
  const htmlString = renderToString(
    <route.component {...match} {...componentData} />
  )
  // { html, css, ids }
  let styleData = {}
  // extract CSS from either Glamor or Emotion
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
    bootstrapData: componentData
  }
  let Document =
    idx(route, _ => _.options.customDocument) ||
    require('../render/default-document').default
  return `<!doctype html>${renderToStaticMarkup(<Document {...renderData} />)}`
}
