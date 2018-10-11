import React from 'react'
import fs from 'fs-extra'
import path from 'path'

import stringifyEscapeScript from '../../utilities/stringify-escape-script'

const getBootstrapData = ({ bootstrapData, ids, _tapestryData }) => (
  <script
    dangerouslySetInnerHTML={{
      __html: `window.__TAPESTRY_DATA__ = { appData: ${stringifyEscapeScript(
        bootstrapData
      )}, ids: ${JSON.stringify(ids)}, _tapestry: ${JSON.stringify(
        _tapestryData
      )} }`
    }}
  />
)

const getJavascriptBundles = () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  ) {
    return <script src={'http://localhost:4001/static/js/bundle.js'} />
  }
  if (process.env.NODE_ENV === 'production') {
    const assetsPath = path.resolve(process.cwd(), '.tapestry', 'assets.json')
    const assets = fs.readJsonSync(assetsPath)
    return Object.keys(assets)
      .filter(Boolean)
      .map((key, index) => <script key={index} src={assets[key].js} />)
  }
}

const DefaultDocument = ({
  html,
  css,
  ids,
  head,
  bootstrapData,
  _tapestryData,
  loadableState
}) => (
  <html lang="en" {...head.htmlAttributes.toComponent()}>
    <head>
      {head.title.toComponent()}
      {head.base.toComponent()}
      {head.meta.toComponent()}
      {head.link.toComponent()}
      {head.script.toComponent()}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <link rel="shortcut icon" href="/public/favicon.ico" />
    </head>
    <body>
      <div id="root" dangerouslySetInnerHTML={{ __html: html }} />
      {loadableState.getScriptElement()}
      {getBootstrapData({ bootstrapData, ids, _tapestryData })}
      {getJavascriptBundles()}
    </body>
  </html>
)

export default DefaultDocument
