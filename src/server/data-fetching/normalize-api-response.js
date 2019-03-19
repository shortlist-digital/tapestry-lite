import idx from 'idx'
import HTTPStatus from 'http-status'

import { log } from '../utilities/logger'

export default (response, route) => {
  // 1: is it a falsey value
  // 2: does it contain a status code? then it'll be an error response from WP
  if (!response || idx(response, _ => _.data.status)) {
    log.warn('Returning error response from normalize-api-response', response)
    // Assign status
    let status = idx(response, _ => _.data.status) || HTTPStatus.NOT_FOUND

    // Check for static routes with no endpoint
    const routeExistsWithNoEndpoint =
      idx(route, _ => _.path) && !idx(route, _ => _.endpoint)

    // If the route is registered but has no endpoint, assume 200
    status = routeExistsWithNoEndpoint ? HTTPStatus.OK : status

    return {
      code: status,
      message: HTTPStatus[status]
    }
  }
  return response
}
