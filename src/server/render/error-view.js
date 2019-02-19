export default ({ config = {}, missing = false }) => {
  // always return custom error if declared
  if (config.components && config.components.CustomError) {
    return config.components.CustomError
  }
  // if _not_ production, return missing view or default tapestry error
  if (process.env.NODE_ENV !== 'production' && missing) {
    return missing
      ? require('./missing-view').default
      : require('./default-error').default
  }
  // otherwise nahp just a nully
  return () => null
}
