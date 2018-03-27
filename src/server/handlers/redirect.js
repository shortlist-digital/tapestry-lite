import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import fetcher from '../data-fetching/fetcher'
import { log } from '../utilities/logger'

const setRedirects = (server, redirects) => {
  server.ext('onPreHandler', async (request, h, err) => {
    if (typeof redirects[request.url.pathname.toLowerCase()] !== 'undefined') {
      log.debug(
        `Redirect handled for ${chalk.green(
          request.url.pathname
        )} to ${chalk.green(redirects[request.url.pathname])}`
      )
      return h
        .redirect(`${redirects[request.url.pathname]}${request.url.search ? request.url.search : ''}`)
        .permanent()
        .takeover()
    }
    return h.continue
  })
}

export default ({ server, config }) => {
  
  // Handle default browser favicon lookup
  server.route({
    method: 'GET',
    path: '/favicon.ico',
    handler: (request, h) => {
      return h
        .redirect('/public/favicon.ico')
        .permanent()
        .rewritable(false)
    }
  })
  // Handle legacy redirects
  let redirects = config.redirectPaths || {}

  const redirectsFile = path.resolve(process.cwd(), 'redirects.json')

  if (fs.existsSync(redirectsFile)) {
    const redirectsFromFile = JSON.parse(fs.readFileSync(redirectsFile, 'utf8'))
    setRedirects(server, Object.assign({}, redirects, redirectsFromFile))
  } else {
    setRedirects(server, redirects)
  }

  if (config.redirectsEndpoint) {
    fetcher(`${config.redirectsEndpoint}?cacheBust=${Date.now()}`)
      .then(resp => {
        if (resp.status === 200) {
          return resp.json()
        } else {
          // Mimic fetch error API
          throw {
            name: 'FetchError',
            message: `Non 200 response ${resp.status}`,
            type: 'http-error'
          }
        }
      })
      .then(data => {
        setRedirects(server, data)
      })
      .catch(err => {
        log.error(`Redirects Endpoint FAILED: `, err)
      })
  }
}
