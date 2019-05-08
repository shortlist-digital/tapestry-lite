import React from 'react'
import { expect } from 'chai'
import request from 'request'
import nock from 'nock'

import CacheManager from '../../src/server/utilities/cache-manager'
import Server from '../../src/server'
import dataPost from '../mocks/post.json'

const prepareJson = data =>
  JSON.stringify(data)
    .replace(/\//g, '\\/')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

describe('Handling preview requests', () => {
  let server = null
  let uri = null
  let config = {
    routes: [
      {
        path: '/dynamic-string-endpoint/:slug',
        endpoint: ({ slug }) => `posts?slug=${slug}`,
        component: () => <p>Custom endpoint</p>
      },
      {
        path: '/custom-base-url/:slug',
        endpoint: ({ slug }) => `posts?slug=${slug}`,
        component: () => <p>Custom endpoint</p>,
        options: { baseUrl: 'https://bloop.com/something' }
      }
    ],
    siteUrl: 'http://preview-dummy.api'
  }

  const cacheManager = new CacheManager()

  before(async () => {
    // mock api response
    nock('http://preview-dummy.api')
      .get(
        '/wp-json/revision/v1/posts?slug=preview-test&tapestry_hash=hash&p=10'
      )
      .reply(200, dataPost)
    nock('https://bloop.com')
      .get('/something/posts?slug=preview-test&tapestry_hash=hash&p=10')
      .reply(200, dataPost)
    // boot tapestry server
    process.env.CACHE_MAX_AGE = 60 * 1000
    server = new Server({ config })
    await server.start()
    uri = server.info.uri
  })

  after(async () => {
    await server.stop()
    delete process.env.CACHE_CONTROL_MAX_AGE
  })

  it('Preview route renders', done => {
    request.get(
      `${uri}/dynamic-string-endpoint/preview-test?tapestry_hash=hash&p=10`,
      (err, res, body) => {
        expect(body).to.contain(prepareJson(dataPost))
        done()
      }
    )
  })

  it('Custom baseUrl route renders', done => {
    request.get(
      `${uri}/custom-base-url/preview-test?tapestry_hash=hash&p=10`,
      (err, res, body) => {
        expect(body).to.contain(prepareJson(dataPost))
        done()
      }
    )
  })
})
