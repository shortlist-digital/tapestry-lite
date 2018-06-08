import DefaultError from './default-error'
import MissingView from './missing-view'

export default ({ config = {}, missing = false }) => {
  // render custom error or default if custom error not declared
  let ErrorView =
    config.components && config.components.CustomError
      ? config.components.CustomError
      : DefaultError
  // render missing component only in DEV
  if (
    (process.env.NODE_ENV === 'test' ||
      process.env.NODE_ENV === 'development') &&
    missing
  ) {
    ErrorView = MissingView
  }
  // return one of the error views
  return ErrorView
}
