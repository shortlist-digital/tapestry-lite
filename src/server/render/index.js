import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

export default function(Component) {
  return renderToStaticMarkup(<Component />)
}
