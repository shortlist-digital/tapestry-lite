import 'isomorphic-fetch'
import 'promis'

import React from 'react'
import { hydrate } from 'react-dom'
import { loadComponents } from 'loadable-components'

import config from '../config/config-proxy'
import Root from './root'

// If page is a WP preview, remove any tapestry related querystring data
// This runs on the client only so it won't affect loading preview data
// Added check for the history API for compatibility with other browsers
if (
  window.location.search.indexOf('tapestry_hash') > -1 &&
  window.history &&
  window.history.replaceState
) {
  window.history.replaceState(
    {},
    document.title,
    `${window.location.protocol}//${window.location.host}${
      window.location.pathname
    }`
  )
}

// Hydrate server rendered CSS with either Emotion or Glamor
if (CSS_PLUGIN === 'emotion')
  require('emotion').hydrate(window.__TAPESTRY_DATA__.ids)
if (CSS_PLUGIN === 'glamor')
  require('glamor').rehydrate(window.__TAPESTRY_DATA__.ids)

loadComponents().then(() =>
  hydrate(<Root {...config} />, document.getElementById('root'))
)
