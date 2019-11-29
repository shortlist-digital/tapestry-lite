import React from 'react'
import { hydrate } from 'react-dom'
import { loadableReady } from '@loadable/component'
import { HelmetProvider } from 'react-helmet-async'

import config from '../config/config-proxy'
import Root from './root'

// Hydrate server rendered CSS with either Emotion or Glamor
if (CSS_PLUGIN === 'emotion')
  require('emotion').hydrate(window.__TAPESTRY_DATA__.ids)
if (CSS_PLUGIN === 'glamor')
  require('glamor').rehydrate(window.__TAPESTRY_DATA__.ids)

loadableReady(() =>
  hydrate(
    <HelmetProvider>
      <Root {...config} />
    </HelmetProvider>,
    document.getElementById('root')
  )
)
