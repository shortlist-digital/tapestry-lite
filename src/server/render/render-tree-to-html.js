import path from 'path'
import fs from 'fs-extra'

import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import { ChunkExtractor } from '@loadable/server'

const helmetContext = {}

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
  const app = (
    <HelmetProvider context={helmetContext}>
      <Component {...data} _tapestry={_tapestryData} />
    </HelmetProvider>
  )
  // create html string from target component
  const statsFile = path.resolve(
    process.cwd(),
    '.tapestry',
    '_assets',
    'loadable-stats.json'
  )
  const statsFileExists = fs.existsSync(statsFile)

  let extractor = null
  let htmlString = null

  if (statsFileExists) {
    // We create extractors from the stats files
    extractor = new ChunkExtractor({
      statsFile,
      entrypoints: ['client']
    })
    htmlString = renderToString(extractor.collectChunks(app))
  } else {
    htmlString = renderToString(app)
  }

  // { html, css, ids }
  let styleData = {}
  // extract html, css and ids from either Glamor or Emotion
  if (process.env.CSS_PLUGIN === 'emotion') {
    styleData = require('emotion-server').extractCritical(htmlString)
  } else {
    styleData = require('glamor/server').renderStaticOptimized(() => htmlString)
  }
  // Assets to come, everything else works
  const renderData = {
    ...styleData,
    head: helmetContext.helmet,
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
