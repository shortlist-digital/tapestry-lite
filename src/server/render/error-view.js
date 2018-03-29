import idx from 'idx'
import DefaultError from './default-error'
import MissingView from './missing-view'

export default ({ config, missing }) => {
  // render custom error or default if custom error not declared
  let ErrorView = idx(config, _ => _.components.CustomError)
    ? config.components.CustomError
    : DefaultError
  // render missing component only in DEV
  if (['test', 'development'].includes(process.env.NODE_ENV) && missing) {
    ErrorView = MissingView
  }
  // return one of the error views
  return ErrorView
}
