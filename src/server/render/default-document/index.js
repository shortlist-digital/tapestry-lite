import React from 'react'
import fs from 'fs-extra'
import path from 'path'
import PropTypes from 'prop-types'

import stringifyEscapeScript from '../../utilities/stringify-escape-script'

const getProductionBundle = () => {
  const assetsPath = path.resolve(process.cwd(), '.tapestry', 'assets.json')
  const assets = fs.readJsonSync(assetsPath)
  return assets.client.js
}

const DefaultDocument = ({ html, css, head, bootstrapData }) => (
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
      {bootstrapData && (
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `window.__BOOTSTRAP_DATA__ = ${stringifyEscapeScript(
              bootstrapData
            )}`
          }}
        />
      )}
    </body>
    {process.env.NODE_ENV === 'production' ? (
      <script src={getProductionBundle()} />
    ) : (
      <script src={'http://localhost:4001/static/js/bundle.js'} />
    )}
  </html>
)

DefaultDocument.propTypes = {
  bootstrapData: PropTypes.object.isRequired,
  css: PropTypes.string.isRequired,
  head: PropTypes.object.isRequired,
  html: PropTypes.string.isRequired
}

export default DefaultDocument
