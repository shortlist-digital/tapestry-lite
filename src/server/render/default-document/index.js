import React from 'react'
// import fs from 'fs-extra'
// import path from 'path'

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

const DefaultDocument = ({
  html,
  css,
  ids,
  head,
  bootstrapData,
  _tapestryData,
  extractor
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
      {extractor.getScriptElements()}
      {getBootstrapData({ bootstrapData, ids, _tapestryData })}
      {/* {(process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test') &&
      getDevelopmentBundle()} */}
    </body>
  </html>
)

export default DefaultDocument
