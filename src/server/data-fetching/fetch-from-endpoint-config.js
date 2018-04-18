import idx from 'idx'
import chalk from 'chalk'
import isPlainObject from 'lodash.isplainobject'
import resolvePaths from '../utilities/resolve-paths'
import apiFetch from './api-fetch'
import { log } from '../utilities/logger'

let query = null
let origin = null
let preview = false
let allowEmpty = false
let fetchRequests = []

const fetchJSON = endpoint => {
  // set default JSON source
  let url = `${origin}/${endpoint}`
  // detect if preview source required
  if (preview) {
    const queryPrefix = endpoint.indexOf('?') > -1 ? '&' : '?'
    const queryParams = `tapestry_hash=${query.tapestry_hash}&p=${query.p}`
    url = `${url}${queryPrefix}${queryParams}`
    log.debug(`API endpoint is a preview: ${chalk.green(url)}`)
  }
  // return fetch as promise
  return apiFetch(url, allowEmpty)
}

const mapArrayToObject = (arr, obj) => {
  const keys = Object.keys(obj)
  return arr.reduce((prev, curr, i) => {
    prev[keys[i]] = arr[i]
    return prev
  }, {})
}

export default async ({
  endpointConfig,
  baseUrl,
  requestUrlObject,
  params,
  allowEmptyResponse
}) => {
  // save data for use in util functions
  query = idx(requestUrlObject, _ => _.query)
  origin = baseUrl
  allowEmpty = allowEmptyResponse
  preview = idx(requestUrlObject, _ => _.query.tapestry_hash)
  // kick off progress loader
  // fetch each endpoint
  const resolvedEndpointConfig = resolvePaths({
    paths: endpointConfig,
    params,
    generatePromise: fetchJSON
  })

  log.debug('Resolved API endpoints', resolvedEndpointConfig.paths)

  // save reference of API request
  fetchRequests.push(resolvedEndpointConfig.paths)

  const isArray = Array.isArray(resolvedEndpointConfig.paths)
  const isObject = isPlainObject(resolvedEndpointConfig.paths)

  // handle endpoint configurations
  // can be one of Array, Object, String
  const result =
    isArray || isObject
      ? Promise.all(resolvedEndpointConfig.result)
      : resolvedEndpointConfig.result
  // wait for all to resolve
  return result.then(
    // update response to original object schema (Promise.all() will return an ordered array so we can map back onto the object correctly)
    resp =>
      isObject ? mapArrayToObject(resp, resolvedEndpointConfig.paths) : resp
  )
}
