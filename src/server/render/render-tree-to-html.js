import path from 'path'
import fs from 'fs'

import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import Helmet from 'react-helmet'
import { ChunkExtractor } from '@loadable/server'

export default async ({
  Component,
  routeOptions = {},
  match,
  componentData,
  queryParams,
  headers
}) => {
  const _tapestryData = {
    requestData: {
      ...match,
      queryParams,
      headers
    }
  }
  const data = Array.isArray(componentData)
    ? { data: componentData }
    : componentData
  const app = <Component {...data} _tapestry={_tapestryData} />
  // create html string from target component
  const statsFile = path.resolve(
    process.cwd(),
    '.tapestry',
    '_assets',
    'loadable-stats.json'
  )
  // We create extractors from the stats files
  const extractor = new ChunkExtractor({
    statsFile,
    entrypoints: ['client']
  })
  // Wrap your application using "collectChunks"
  // Render your application
  const htmlString = renderToString(
    fs.existsSync(statsFile) ? extractor.collectChunks(app) : app
  )
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
    bootstrapData: data,
    _tapestryData,
    extractor
  }
  let Document =
    routeOptions.customDocument || require('./default-document').default

  const doctype = routeOptions.customDoctype || '<!doctype html>'

  return `${routeOptions.disableDoctype ? '' : doctype}${renderToStaticMarkup(
    <Document {...renderData} />
  )}`
}
