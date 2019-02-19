import chalk from 'chalk'
import { log } from '../utilities/logger'

export default (response, { path, endpoint } = {}) => {
  // 1: is it a falsey value
  // 2: does it contain a status code? then it'll be an error response from WP
  if (!response || (response.data && response.data.status)) {
    log.warn('Returning error response from normalize-api-response', response)

    if (!response) {
      return {
        status: 404,
        statusText: 'Not Found'
      }
    }
    // Check for static routes with no endpoint
    // If the route is registered but has no endpoint, assume 200
    if (path && !endpoint) {
      return {
        status: 200,
        statusText: 'OK'
      }
    }

    return response.data
  }

  log.silly(
    `Should wrap API response in object "{ data: response }": ${chalk.green(
      Boolean(Array.isArray(response))
    )}`
  )
  // WP returns single objects or arrays
  // to avoid React mangling the array to {'0':{},'1':{}}
  // wrap in an object
  return Array.isArray(response) ? { data: response } : response
}
