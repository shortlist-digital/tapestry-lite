import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
export default function(Component) {
  console.log(Component)
  return renderToStaticMarkup(<Component />)
}
