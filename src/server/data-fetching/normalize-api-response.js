import idx from 'idx'
import HTTPStatus from 'http-status'
import isEmpty from 'lodash.isempty'

export default (response, route) => {
  // WP returns single objects or arrays
  const arrayResp = Array.isArray(response)
  // 1: is it a falsey value
  // 2: does it contain a status code? then it'll be an error response from WP
  // 3: is it an array, that is empty, and options.allowEmptyResponse is falsey
  if (
    !response ||
    idx(response, _ => _.data.status) ||
    (arrayResp &&
      isEmpty(response) &&
      !idx(route, _ => _.options.allowEmptyResponse))
  ) {
    // Assign status
    let status = idx(response, _ => _.data.status) || HTTPStatus.NOT_FOUND

    // Check for static routes with no endpoint
    const routeExistsWithNoEndpoint =
      idx(route => _.path) && !idx(routeConfig, _ => _.endpoint)

    // If the route is registered but has no endpoint, assume 200
    status = routeExistsWithNoEndpoint ? HTTPStatus.OK : status

    return {
      code: status,
      message: HTTPStatus[status]
    }
  }
  // to avoid React mangling the array to {'0':{},'1':{}}
  // wrap in an object
  return arrayResp ? { data: response } : response
}
