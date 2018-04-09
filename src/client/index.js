import React from 'react'
import { hydrate } from 'react-dom'
import config from '../config/config-proxy'
import Root from './root'

// Hydrate server rendered CSS with either Emotion or Glamor
if (process.env.CSS_PLUGIN === 'emotion')
  require('emotion').hydrate(window.__data.ids)
if (process.env.CSS_PLUGIN === 'glamor')
  require('glamor').rehydrate(window.__data.ids)

hydrate(<Root {...config} />, document.getElementById('root'))
