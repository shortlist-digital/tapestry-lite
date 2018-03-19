import React from 'react'
import { hydrate } from 'react-dom'
import config from '../config/config-proxy'
import Root from './root'

const renderApp = config => {
  // define routes/history for react-router
  const targetNode = document.getElementById('root')

  hydrate(
    <Root {...config} />,
    targetNode
  )
}

renderApp(config)
