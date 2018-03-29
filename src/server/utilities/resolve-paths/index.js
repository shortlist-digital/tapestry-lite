import isFunction from 'lodash.isfunction'
import isPlainObject from 'lodash.isplainobject'

export default ({ paths, params, generatePromise }) => {
  // resolve function if required
  if (isFunction(paths)) {
    paths = paths(params)
  }
  // return
  if (typeof generatePromise !== 'function') {
    return { paths }
  }
  // handle endpoint configurations
  // can be one of Array, Object, String
  if (Array.isArray(paths)) {
    return {
      paths,
      result: paths.map(generatePromise)
    }
  }

  if (isPlainObject(paths)) {
    return {
      paths,
      result: Object.keys(paths).map(i => generatePromise(paths[i]))
    }
  }

  return {
    paths,
    result: generatePromise(paths)
  }
}
