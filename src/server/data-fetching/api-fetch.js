import chalk from 'chalk'

import fetcher from './fetcher'
import timing from '../utilities/timing'
import { log } from '../utilities/logger'

export default url => {
  timing.start(`fetch: ${url}`)

  return fetcher(url)
    .then(resp => {
      const { ok, status, statusText } = resp

      log.debug(`API Fetch: Response for ${chalk.green(url)}`, {
        ok,
        status,
        statusText
      })

      if (!ok) {
        throw {
          name: 'FetchError',
          type: 'http-error',
          status,
          statusText
        }
      }

      return resp.json()
    })
    .then(resp => {
      timing.end(`fetch: ${url}`)
      log.silly(`API Fetch: Data from ${chalk.green(url)}`)
      return resp
    })
    .catch(err => log.error(`API Fetch: Catch error`, err))
}
