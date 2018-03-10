import React from 'react'
import HTTPStatus from 'http-status'
import Helmet from 'react-helmet'
import { expect } from 'chai'
import request from 'request'
import r from 'requisition'
import nock from 'nock'

import TapestryLite from '../../src/server/server'
import dataPost from '../mocks/post.json'
import dataPosts from '../mocks/posts.json'
import dataPage from '../mocks/page.json'

describe('Error view rendering', () => {
  let server = null
  let config = {
    components: {},
    siteUrl: 'http://error-dummy.api'
  }

  before(done => {
    // mock api response
    nock('http://error-dummy.api')
      .get('/wp-json/wp/v2/posts?_embed')
      .times(5)
      .reply(200, dataPosts.data)
      .get('/wp-json/wp/v2/posts?slug=slug&_embed')
      .reply(200, dataPage)
      .get('/wp-json/wp/v2/pages?slug=404-route&_embed')
      .times(5)
      .reply(404, { data: { status: 404 } })
    done()
  })

  afterEach(async () => await server.stop())

  it('Show MissingView in DEV if component missing', async () => {
    server = new TapestryLite({config})
    await server.start()
    let res = await r.get(server.info.uri)
    let body = await res.text()
    expect(body).to.contain('Missing component')
  })

  it('Show DefaultError in PROD if component missing', async () => {
    server = new TapestryLite({config})
    await server.start()
    let res = await r.get(server.info.uri)
    let body = await res.text()
    expect(body).to.contain('Application Error')
  })

  it('Show DefaultError if API 404', async () => {
    server = new TapestryLite({
      config: {
        ...config,
        components: { Page: () => <p>Hello</p> }
      }
    })
    await server.start()
    let res = await r.get(`${server.info.uri}/404-route`)
    let body = await res.text()
    expect(body).to.contain(404)
    expect(body).to.contain(HTTPStatus[404])
  })

  it('Show DefaultError if route 404', async () => {
    server = new TapestryLite({
      config: {
        ...config,
        components: { Page: () => <p>Hello</p> }
      }
    })
    await server.start()
    let res = await r.get(`${server.info.uri}/route/not/matched/in/any/way`)
    let body = await res.text()
    expect(body).to.contain(404)
    expect(body).to.contain(HTTPStatus[404])
  })

  it('Show CustomError if defined', async () => {
    server = new TapestryLite({
      config: {
        ...config,
        components: {
          CustomError: () => <p>Custom Error</p>,
          Page: () => <p>Hello</p>
        }
      }
    })
    await server.start()
    let res = await r.get(`${server.info.uri}/404-route`)
    let body = await res.text()
    expect(body).to.contain('Custom Error')
  })

  it('Status code and message are available to CustomError', async () => {
    server = new TapestryLite({
      config: {
        ...config,
        components: {
          CustomError: ({ code, message }) => (
            <p>
              Custom Error {code} {message}
            </p>
          ),
          Page: () => <p>Hello</p>
        }
      }
    })
    await server.start()
    let res = await r.get(`${server.info.uri}/404-route`)
    let body = await res.text()
    expect(body).to.contain('Custom Error')
    expect(body).to.contain('404')
    expect(body).to.contain('Not Found')
  })
})

