import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import Helmet from 'react-helmet'

export default async ({
  Component,
  routeOptions = {},
  match,
  componentData
}) => {
  const htmlString = renderToString(<Component {...match} {...componentData} />)
  // { html, css, ids }
  let glamorData = {
    css: ''
  }
  let emotionData = {
    css: ''
  }
  // extract CSS from either Glamor or Emotion
  if (process.env.CSS_PLUGIN === 'emotion') {
    emotionData = require('emotion-server').extractCritical(htmlString)
  } else if (process.env.CSS_PLUGIN === 'migration') {
    emotionData = require('emotion-server').extractCritical(htmlString)
    glamorData = require('glamor/server').renderStaticOptimized(
      () => htmlString
    )
  } else {
    glamorData = require('glamor/server').renderStaticOptimized(
      () => htmlString
    )
  }
  const helmet = Helmet.renderStatic()
  // Assets to come, everything else works
  const renderData = {
    html: htmlString,
    css: `${glamorData.css} ${emotionData.css}`,
    ids: {
      glamor: glamorData.ids,
      emotion: emotionData.ids
    },
    head: helmet,
    bootstrapData: componentData
  }
  let Document =
    routeOptions.customDocument || require('../render/default-document').default
  return `<!doctype html>${renderToStaticMarkup(<Document {...renderData} />)}`
}
