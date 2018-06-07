import React from 'react'
import { expect } from 'chai'
import request from 'request'
import nock from 'nock'

import CacheManager from '../../src/server/utilities/cache-manager'
import Server from '../../src/server'
import dataPost from '../mocks/post.json'

const createRequestData = request => {
  // console.log('> request', request)
  return {
    requestData: {
      isExact: true,
      params: {},
      path: '',
      queryParams: {},
      url: ''
    }
  }
}

const prepareJson = data => {
  const str = JSON.stringify(data)
    .replace(/\//g, '\\/')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

  // Remove last '}' to make string matching logic more forgiving
  return str.substring(0, str.length - 1)
}

describe('Handling preview requests', () => {
  let server = null
  let uri = null
  let config = {
    routes: [
      {
        path: '/dynamic-string-endpoint/:slug',
        endpoint: ({ slug }) => `posts?slug=${slug}`,
        component: () => <p>Custom endpoint</p>
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
        expect(body).to.have.string(prepareJson(dataPost))
        done()
      }
    )
  })
})
