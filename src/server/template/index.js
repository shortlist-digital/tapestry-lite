import React from 'react'
import parse from 'html-react-parser'

import stringifyEscapeScript from '../utilities/stringify-escape-script'

const toDocumentFromObject = ({
  htmlString,
  css,
  extractor = '',
  compData,
  ids,
  _tapestryData,
  helmet
}) => {
  const {
    htmlAttributes = [],
    title = '',
    base = '',
    meta = '',
    link = '',
    script = ''
  } = helmet

  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        {title && parse(title)}
        {base && parse(base)}
        {meta && parse(meta)}
        {link && parse(link)}
        {script && parse(script)}
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <link rel="shortcut icon" href="/public/favicon.ico" />
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: htmlString }} />
        {Boolean(extractor) && parse(extractor)}
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
