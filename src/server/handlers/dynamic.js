import chalk from 'chalk'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'

import CacheManager, { getCacheKey } from '../utilities/cache-manager'
import { log } from '../utilities/logger'

import tapestryRender from '../render/tapestry-render'

const HtmlTemplate = require('../template').default

const cacheManager = new CacheManager()
const cache = cacheManager.createCache('html')

const renderHtmlResponse = async ({ request, h, config }) => {
  const currentPath = request.url.pathname || '/'
  const isPreview = Boolean(request.query && request.query.tapestry_hash)

  const cacheKey = getCacheKey(currentPath, request, config.cacheKeyHandler)
  const cacheObject = await cache.get(cacheKey)

  // If there's a cache response, return the response straight away
  if (cacheObject && !isPreview) {
    log.debug(`Rendering HTML from cache: ${chalk.green(cacheKey)}`)

    const responseToHtml = renderToStaticMarkup(
      <HtmlTemplate {...cacheObject} />
    )

    return h
      .response(responseToHtml)
      .type('text/html')
      .code(200)
  } else {
    log.debug(`Skipping cache: ${chalk.green(cacheKey)}`)
  }

  // Get headers and filter by client config
  const headers = {}
  const configHeaders = config.headers
  const requestHeaders = request.headers
  if (Array.isArray(configHeaders))
    configHeaders.forEach(key => {
      Object.keys(requestHeaders).includes(key)
        ? (headers[key] = requestHeaders[key])
        : (headers[key] = null)
    })

  const { componentNeeds, status, shouldCache } = await tapestryRender(
    currentPath,
    request.query,
    config,
    headers
  )

  const responseToHtml = renderToStaticMarkup(
    <HtmlTemplate {...componentNeeds} />
  )

  const response = h
    .response(responseToHtml)
    .type('text/html')
    .code(status)

  // cache _must_ be set after response is created
  if (!isPreview && shouldCache && status === 200) {
    log.debug(`Setting html in cache: ${chalk.green(cacheKey)}`)
    cache.set(cacheKey, componentNeeds)
  }

  if (isPreview) {
    response.header('cache-control', 'no-cache')
  }

  return response
}

export default ({ server, config }) => {
  server.route({
    options: {
      cache: {
        expiresIn:
          (parseInt(process.env.CACHE_CONTROL_MAX_AGE, 10) || 0) * 1000, // 1 Minute
        privacy: 'public'
      }
    },
    method: 'GET',
    path: '/{path*}',
    handler: async (request, h) => renderHtmlResponse({ request, h, config })
  })
}
