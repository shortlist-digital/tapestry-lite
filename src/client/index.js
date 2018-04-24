import React from 'react'
import { hydrate } from 'react-dom'
import config from '../config/config-proxy'
import Root from './root'

// Hydrate server rendered CSS with either Emotion or Glamor
if (CSS_PLUGIN === 'emotion')
  require('emotion').hydrate(window.__data.ids.emotion)
if (CSS_PLUGIN === 'glamor')
  require('glamor').rehydrate(window.__data.ids.glamor)
// Mad migration mode
if (CSS_PLUGIN === 'migration') {
  require('emotion').hydrate(window.__data.ids.emotion)
  require('glamor').rehydrate(window.__data.ids.glamor)
}

hydrate(<Root {...config} />, document.getElementById('root'))
