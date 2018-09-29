import chalk from 'chalk'
import isEmpty from 'lodash.isempty'

import prepareAppRoutes from '../routing/prepare-app-routes'
import matchRoutes from '../routing/match-routes'

import normalizeApiResponse from '../data-fetching/normalize-api-response'
import fetchFromEndpointConfig from '../data-fetching/fetch-from-endpoint-config'

import buildErrorView from '../render/error-view'
import renderTreeToHTML from '../render/tree-to-html'

import baseUrlResolver from '../utilities/base-url-resolver'
import normaliseUrlPath from '../utilities/normalise-url-path'
import CacheManager from '../utilities/cache-manager'
import { log } from '../utilities/logger'

const renderErrorTree = async ({
  errorComponent,
  route,
  match,
  componentData,
  h,
  config
}) => {
  log.silly('Rendering Error HTML')
  const responseString = await renderTreeToHTML({
    Component: errorComponent,
    routeOptions: route.options,
    match,
    componentData,
    config
  })
  log.silly('Error Data: ', componentData)
  return h
    .response(responseString)
    .type('text/html')
    .code(componentData.code || 404)
}

const renderSuccessTree = async (
  { route, match, componentData, isPreview, h, queryParams, config },
  cache,
  cacheKey
) => {
  log.silly('Rendering Success HTML', { match })

  const responseString = await renderTreeToHTML({
    Component: route.component,
    routeOptions: route.options,
    match,
    componentData,
    queryParams,
    config
  })
  const response = h
    .response(responseString)
    .type('text/html')
    .code(200)
  // only set cache if _not_ a preview
  if (!isPreview) {
    log.debug(`Setting html in cache: ${chalk.green(cacheKey)}`)
    cache.set(cacheKey, responseString)
  }
  // send back no-cache header if preview
  if (isPreview) {
    response.header('cache-control', 'no-cache')
  }
  return response
}

export default ({ server, config }) => {
  const cacheManager = new CacheManager()
  const cache = cacheManager.createCache('html')
  const routes = prepareAppRoutes(config)
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
    handler: async (request, h) => {
      // Set a cache key
      const currentPath = request.url.pathname || '/'
      const isPreview = Boolean(request.query && request.query.tapestry_hash)
      const cacheKey = normaliseUrlPath(currentPath)
      // Is there cached HTML?
      const cachedHTML = await cache.get(cacheKey)
      // If there's a cache response, return the response straight away
      if (cachedHTML) {
        log.debug(`Rendering HTML from cache: ${chalk.green(cacheKey)}`)
        return h
          .response(cachedHTML)
          .type('text/html')
          .code(200)
      }

      const queryParams = request.query

      // Don't even import react-router any more, but backwards compatible
      // With the exception of optional params: (:thing) becomes :thing?
      // Match Routes
      // this should only have one route as we force "exact" on each route
      // How would we error out if two routes match here? "Ambigous routes detected?" maybe earlier in app
      const { route, match } = matchRoutes(routes, request.url.pathname)

      log.debug(`Matched route ${chalk.green(route.path)}`)
      // This needs tidying
      // If there's a branch of the route config, we have a route
      // Optimistic default component data for static routes
      let componentData = {
        status: 200,
        message: '200'
      }

      // Set a flag for whether we have a missing component later on
      const routeComponentUndefined = typeof route.component === 'undefined'
      // If we have an endpoint
      if (route.endpoint) {
        // Start to try and fetch data
        const multidata = await fetchFromEndpointConfig({
          endpointConfig: route.endpoint,
          baseUrl: baseUrlResolver(config, request.url),
          requestUrlObject: request.url,
          params: match.params
        })
        componentData = normalizeApiResponse(multidata, route)
      }
      if (componentData.code > 299 || routeComponentUndefined) {
        log.debug(`Render Error component`, {
          componentData,
          routeComponentUndefined
        })

        const errorComponent = buildErrorView({
          config,
          missing: routeComponentUndefined
        })

        return renderErrorTree({
          errorComponent,
          route,
          match,
          componentData,
          h,
          config
        })
      }

      // If our route is the not found route
      // Overwrite the data
      const loadedData = componentData.data || componentData
      if (route.notFoundRoute || (route.endpoint && isEmpty(loadedData))) {
        log.silly(
          'Route is "not found" route',
          route.endpoint,
          isEmpty(loadedData),
          componentData,
          route.notFoundRoute
        )
        componentData = {
          message: 'Not Found',
          code: 404
        }
        const errorComponent = buildErrorView({
          config,
          missing: routeComponentUndefined
        })
        return renderErrorTree({
          errorComponent,
          route,
          match,
          componentData,
          h,
          config
        })
      }

      return renderSuccessTree(
        {
          route,
          match,
          componentData,
          isPreview,
          h,
          queryParams,
          config
        },
        cache,
        cacheKey
      )
    }
  })
}
