import fs from 'fs'
import path from 'path'

import React from 'react'
import { expect } from 'chai'
import request from 'request'
import r from 'requisition'
import nock from 'nock'

import Server from '../../src/server'
import dataPage from '../mocks/page.json'
import dataRedirects from '../mocks/redirects.json'

describe('Handling redirects', () => {
  let redirectsFilePath = path.resolve(process.cwd(), 'redirects.json')
  let server = null
  let uri = null
  let config = {
    routes: [
      {
        path: '/page',
        component: () => <p>Redirected component</p>
      }
    ],
    redirectPaths: {
      '/redirect/from/this-path': '/page',
      '/redirect/with/query': '/page',
      '/test()what£]cool': '/page'
    },
    redirectsEndpoint: 'http://dummy.api/web/app/uploads/redirects.json',
    siteUrl: 'http://dummy.api'
  }

  before(async () => {
    // create redirects file sync to prevent race condition
    fs.writeFileSync(
      redirectsFilePath, // file name
      JSON.stringify(dataRedirects), // create dummy file
      'utf8' // encoding
    )

    nock('http://dummy.api')
      .get('/web/app/uploads/redirects.json')
      .query(true)
      .times(1)
      .reply(200, { '/redirect/from/endpoint': '/page' })

    // boot tapestry server
    server = new Server({config})
    await server.start()
    uri = server.info.uri
  })

  after(async () => {
    fs.unlink(redirectsFilePath, () => {}) // tidy up redirects.json asynchronously
    await server.stop()
  })

  it('Redirect returns 301 status', async () => {
    let res = await server.inject(`${uri}/redirect/from/this-path`)
    expect(res.statusCode).to.equal(301)
  })

  it('Redirect returns 301 with strange characters', async () => {
    let res = await server.inject(`${uri}/test()what£]cool`)
    expect(res.statusCode).to.equal(301)
  })

  it('Redirect returns 301 status insensitive to case', async () => {
    let res = await server.inject(`${uri}/reDirect/From/tHis-path`)
    expect(res.statusCode).to.equal(301)
  })

  it('Redirect path contains querystring', done => {
    const query = '?querystring=something'
    request.get(`${uri}/redirect/with/query${query}`, (err, res, body) => {
      expect(res.req.path).to.contain(`/page${query}`)
      done()
    })
  })

  it('Redirect path redirects correctly', done => {
    request.get(`${uri}/redirect/from/this-path`, (err, res, body) => {
      expect(body).to.contain('Redirected component')
      expect(res.statusCode).to.equal(200)
      done()
    })
  })

  it('Redirect path loaded from `redirects.json` file', done => {
    request.get(`${uri}/redirect/from/this`, (err, res, body) => {
      expect(body).to.contain('Redirected component')
      expect(res.statusCode).to.equal(200)
      done()
    })
  })
})

describe('Handling endpoint redirects', () => {
  let server = null
  let uri = null
  let config = {
    routes: [
      {
        path: '/page',
        component: () => <p>Redirected component</p>
      }
    ],
    redirectsEndpoint: 'http://dummy.api/web/app/uploads/redirects.json',
    siteUrl: 'http://dummy.api'
  }

  afterEach(async () => await server.stop())

  it('Redirect path loaded from redirects endpoint', async () => {
    nock('http://dummy.api')
      .get('/web/app/uploads/redirects.json')
      .query(true)
      .times(1)
      .reply(200, dataRedirects)

    // boot tapestry server
    server = new Server({config})
    await server.start()
    uri = server.info.uri
    let res = await r.get(`${uri}/redirect/from/this`)
    let body = await res.text()
    expect(body).to.contain('Redirected component')
    expect(res.statusCode).to.equal(200)
  })

  it('Server handles 404 gracefully', async () => {
    nock('http://dummy.api')
      .get('/web/app/uploads/redirects.json')
      .query(true)
      .reply(404)

    // boot tapestry server
    server = new Server({config})
    await server.start()
    uri = server.info.uri
    let res = await r.get(`${uri}/page`)
    let body = await res.text()
    expect(body).to.contain('Redirected component')
    expect(res.statusCode).to.equal(200)
  })

  it('Server handles invalid data gracefully', async () => {
    nock('http://dummy.api')
      .get('/web/app/uploads/redirects.json')
      .query(true)
      .reply(200, 'Error: <p>Something went wrong')

    // boot tapestry server
    server = new Server({config})
    await server.start()
    uri = server.info.uri
    let res = await r.get(`${uri}/page`)
    let body = await res.text()
    expect(body).to.contain('Redirected component')
    expect(res.statusCode).to.equal(200)
  })
})
