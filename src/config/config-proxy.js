import { hot } from 'react-hot-loader'
import appConfig from 'tapestry.config.js'
import validate from './validator'

if (process.env.NODE_ENV !== 'production') {
  validate(appConfig)
}

export default hot(module)(appConfig)
