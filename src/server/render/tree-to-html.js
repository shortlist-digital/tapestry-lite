import React from 'react'
import { renderStaticOptimized } from 'glamor/server'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import Helmet from 'react-helmet'
import idx from 'idx'

export default ({route, match, componentData}) => {
  // Glamor works as before
  const { html, css, ids } = renderStaticOptimized(() =>
    renderToString(<route.component {...match} {...componentData} />)
  )
  const helmet = Helmet.renderStatic()
  // Assets to come, everything else works
  const renderData = {
    html,
    css,
    ids,
    head: helmet,
    bootstrapData: componentData
  }
  let Document = idx(route, _ => _.options.customDocument) || require('../render/default-document').default
  return `<!doctype html>${renderToStaticMarkup(<Document {...renderData} />)}`
}

