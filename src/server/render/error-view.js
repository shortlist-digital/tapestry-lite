import idx from 'idx'
import DefaultError from './default-error'

export default ({ config, missing }) => {
  // render custom error or default if custom error not declared
  let ErrorView = idx(config, _ => _.components.CustomError)
    ? config.components.CustomError
    : DefaultError
  // render missing component only in DEV
  if ((['test', 'development'].includes(process.env.NODE_ENV)) && missing) {
    console.log('loading missing view')
    ErrorView = require('./missing-view').default
  }
  // return one of the error views
  return ErrorView
}

