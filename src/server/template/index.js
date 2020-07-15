import React from 'react'

import stringifyEscapeScript from '../utilities/stringify-escape-script'

const toDocumentFromObject = ({
  htmlString,
  css,
  extractor = null,
  compData,
  ids,
  _tapestryData,
  helmet
}) => {
  return (
    <html lang="en" {...helmet.htmlAttributes.toComponent()}>
      <head>
        {helmet.title.toComponent()}
        {helmet.base.toComponent()}
        {helmet.meta.toComponent()}
        {helmet.link.toComponent()}
        {helmet.script.toComponent()}
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <link rel="shortcut icon" href="/public/favicon.ico" />
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: htmlString }} />
        {extractor && extractor.getScriptElements()}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__TAPESTRY_DATA__ = { appData: ${stringifyEscapeScript(
              compData
            )}, ids: ${JSON.stringify(ids)}, _tapestry: ${JSON.stringify(
              _tapestryData
            )} }`
          }}
        />
      </body>
    </html>
  )
}

export default toDocumentFromObject
