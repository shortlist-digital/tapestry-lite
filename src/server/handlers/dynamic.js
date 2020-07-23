import chalk from 'chalk'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'

import CacheManager, { getCacheKey } from '../utilities/cache-manager'
import { log } from '../utilities/logger'

import tapestryRender from '../render/tapestry-render'

import prepareAppRoutes from '../routing/prepare-app-routes'
import matchRoutes from '../routing/match-routes'

const HtmlTemplate = require('../template').default

const cacheManager = new CacheManager()
const cache = cacheManager.createCache('html')

const buildNewServerSideRender = async ({ currentPath, config, request }) => {
  const headers = {}
  const configHeaders = config.headers
  const requestHeaders = request.headers
  if (Array.isArray(configHeaders))
    configHeaders.forEach(key => {
      Object.keys(requestHeaders).includes(key)
        ? (headers[key] = requestHeaders[key])
        : (headers[key] = null)
    })

  const { componentNeeds, status } = await tapestryRender(
    currentPath,
    request.query,
    config,
    headers
  )

  return {
    componentNeeds,
    status
  }
}

const getDocument = route =>
  route.options?.customDocument ? route.options.customDocument : HtmlTemplate
const getDoctype = route => {
  if (route.options && route.options.disableDoctype) return ''

  return route.options && route.options.customDoctype
    ? route.options.customDoctype
    : '<!doctype html>'
}

const renderHtmlResponse = async ({ request, h, config }) => {
  const currentPath = request.url.pathname || '/'
  const isPreview = Boolean(request.query && request.query.tapestry_hash)
  const { route } = matchRoutes(prepareAppRoutes(config), currentPath)

  const Document = getDocument(route)
  const doctype = getDoctype(route)

  const cacheKey = getCacheKey(currentPath, request, config.cacheKeyHandler)
  const cacheObject = await cache.get(cacheKey)

  // If there's a cache response, return the response straight away
  if (cacheObject && !isPreview) {
    log.debug(`Rendering HTML from cache: ${chalk.green(cacheKey)}`)

    const parsedCacheObject = JSON.parse(cacheObject)
    let responseToHtml
    let status

    // If we meet the criteria to render a cache response, do so
    if (parsedCacheObject.htmlString) {
      responseToHtml = `${doctype}${renderToStaticMarkup(
        <Document {...parsedCacheObject} />
      )}`
      status = 200 // We only cache if 200
    } else {
      // Else, build out a new server side render (predominantly here to support legacy cache)
      const {
        componentNeeds,
        status: newResponseStatus
      } = await buildNewServerSideRender({ currentPath, config, request })
      responseToHtml = `${doctype}${renderToStaticMarkup(
        <Document {...componentNeeds} />
      )}`
      status = newResponseStatus
    }

    return h
      .response(responseToHtml)
      .type('text/html')
      .code(status)
  } else {
    log.debug(`Skipping cache: ${chalk.green(cacheKey)}`)
  }

  const { componentNeeds, status } = await buildNewServerSideRender({
    currentPath,
    config,
    request
  })

  const responseToHtml = `${doctype}${renderToStaticMarkup(
    <Document {...componentNeeds} />
  )}`

  const response = h
    .response(responseToHtml)
    .type('text/html')
    .code(status)

  // cache _must_ be set after response is created
  if (!isPreview && status === 200 && !process.env.DISABLE_CACHE) {
    log.debug(`Setting html in cache: ${chalk.green(cacheKey)}`)
    cache.set(cacheKey, JSON.stringify(componentNeeds))
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
