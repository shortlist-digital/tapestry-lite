import React from 'react'
import PropTypes from 'prop-types'
import stringifyEscapeScript from '../../utilities/stringify-escape-script'

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
    <script src="http://localhost:4001/static/js/bundle.js" />
  </html>
)

DefaultDocument.propTypes = {
  bootstrapData: PropTypes.object.isRequired,
  css: PropTypes.string.isRequired,
  head: PropTypes.object.isRequired,
  html: PropTypes.string.isRequired
}

export default DefaultDocument
