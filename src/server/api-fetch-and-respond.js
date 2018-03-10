import fetcher from '../shared/fetcher'
import { log } from '../utilities/logger'
import chalk from 'chalk'

const AFAR = (url) => {
  fetcher(url)
    .then(resp => {
      if (!resp.ok) {
        throw {
          // Fetch library properties
          name: 'FetchError',
          type: 'http-error',
          // Traditional request properties
          status: resp.status,
          statusText: resp.statusText,
          // Tapestry properties
          message: resp.statusText,
          code: resp.status
        }
      } else {
        return resp
      }
    })
    .then(resp => resp.json())
    .then(apiData => {
      return apiData
    })
}

export default AFAR
