export default ({ config = {}, missing = false }) => {
  let ErrorView = () => null
  // render missing component only in DEV
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'development'
  ) {
    ErrorView = missing ? require('./missing-view') : require('./default-error')
  }
  // render custom error
  if (config.components && config.components.CustomError) {
    ErrorView = config.components.CustomError
  }
  // return one of the error views
  return ErrorView
}
