import path from 'path'
import fs from 'fs-extra'
import React from 'react'
import { renderToString } from 'react-dom/server'
import Helmet from 'react-helmet'
import { ChunkExtractor } from '@loadable/server'

export default async ({
  Component,
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

  const helmet = Helmet.renderStatic()

  const responseData = {
    htmlString: styleData.html,
    css: styleData.css,
    ids: styleData.ids,
    extractor,
    _tapestryData,
    compData: data,
    helmet,
    htmlAttributes: helmet.htmlAttributes.toComponent(),
    htmlTitle: helmet.title.toComponent()
  }

  return responseData
}
