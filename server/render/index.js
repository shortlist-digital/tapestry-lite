import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
export default function() {
  return renderToStaticMarkup(<p>Life is good </p>)
}
