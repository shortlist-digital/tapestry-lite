import idx from 'idx'
import HTTPStatus from 'http-status'
import isEmpty from 'lodash.isempty'
import isPlainObject from 'lodash.isplainobject'
import isFunction from 'lodash.isfunction'

export default (response, route) => {
  // WP returns single objects or arrays
  const arrayResp = Array.isArray(response)
  // We can configure a route response to be an object "on purpose"
  // We can't check if the response is supposed to be an object inside the function,
  // so we dangerously assume it's on purpose if it's in a function
  const objectOnPurpose = isPlainObject(route.endpoint) || isFunction(route.endpoint)
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
      idx(route, _ => _.path) && !idx(route, _ => _.endpoint)

    // If the route is registered but has no endpoint, assume 200
    status = routeExistsWithNoEndpoint ? HTTPStatus.OK : status

    return {
      code: status,
      message: HTTPStatus[status]
    }
  }
  // to avoid React mangling the array to {'0':{},'1':{}}
  // wrap in an object
  return (objectOnPurpose || arrayResp) ? { data: response } : response
}
