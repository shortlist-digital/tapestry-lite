import React from 'react'
import fs from 'fs-extra'
import path from 'path'
import PropTypes from 'prop-types'

import stringifyEscapeScript from '../../utilities/stringify-escape-script'

const getProductionBundles = () => {
  const assetsPath = path.resolve(process.cwd(), '.tapestry', 'assets.json')
  const assets = fs.readJsonSync(assetsPath)
  return Object.values(assets).map(({ js }, index) => (
    <script key={index} src={js} />
  ))
}

const DefaultDocument = ({ html, css, ids, head, bootstrapData }) => (
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
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `window.__data = { appData: ${stringifyEscapeScript(
            bootstrapData
          )}, ids: ${JSON.stringify(ids)} }`
        }}
      />
      {process.env.NODE_ENV === 'production' ? (
        getProductionBundles()
      ) : (
        <script src={'http://localhost:4001/static/js/bundle.js'} />
      )}
    </body>
  </html>
)

DefaultDocument.propTypes = {
  bootstrapData: PropTypes.object.isRequired,
  css: PropTypes.string.isRequired,
  head: PropTypes.object.isRequired,
  html: PropTypes.string.isRequired
}

export default DefaultDocument
