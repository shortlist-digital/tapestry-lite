import React from 'react'
import { expect } from 'chai'
import request from 'request'
import nock from 'nock'

import Server from '../../src/server'
import dataPosts from '../mocks/posts.json'
import dataPages from '../mocks/posts.json'

describe('Handling server responses', () => {
  let server = null
  let uri = null
  let config = {
    routes: [
      {
        path: '/',
        endpoint: () => 'posts?_embed',
        component: () => <p>Root</p>
      },
      {
        path: '/:cat/:subcat/:id',
        component: () => <p>3 Dynamic</p>
      },
      {
        path: '/404-response',
        endpoint: () => 'pages?slug=404-response',
        component: () => <p>404 Response</p>
      },
      {
        path: '/empty-response',
        endpoint: () => 'pages?slug=empty-response',
        component: () => <p>Empty Response</p>
      },
      {
        path: '/static-endpoint',
        component: () => <p>Static endpoint</p>
      },
      {
        path: '/object-endpoint',
        endpoint: {
          pages: 'pages',
          posts: 'posts'
        },
        component: () => <p>Custom endpoint</p>
      },
      {
        path: '/array-endpoint-error',
        endpoint: ['pages?slug=404-response', 'pages'],
        component: () => <p>404 Response</p>
      },
      {
        path: '/object-endpoint-error',
        endpoint: {
          one: 'pages?slug=404-response',
          two: 'pages'
        },
        component: () => <p>404 Response</p>
      }
    ],
    siteUrl: 'http://response-dummy.api'
  }

  before(async () => {
    // mock api response
    nock('http://response-dummy.api')
      .get('/wp-json/wp/v2/posts/571')
      .times(1)
      .reply(200, dataPages.data)
      .get('/wp-json/wp/v2/pages')
      .times(1)
      .reply(200, dataPages.data)
      .get('/wp-json/wp/v2/posts')
      .times(1)
      .reply(200, dataPosts.data)
      .get('/wp-json/wp/v2/posts?_embed')
      .times(5)
      .reply(200, dataPosts.data)
      .get('/wp-json/wp/v2/pages?slug=404-response')
      .times(10)
      .reply(404, { data: { status: 404 } })
      .get('/wp-json/wp/v2/pages?slug=empty-response')
      .times(5)
      .reply(200, [])
    // boot tapestry server
    process.env.CACHE_CONTROL_MAX_AGE = 60
    server = new Server({ config })
    await server.start()
    uri = server.info.uri
  })

  after(async () => {
    await server.stop()
    delete process.env.CACHE_CONTROL_MAX_AGE
  })

  it('Route matched, status code is 200', done => {
    request.get(uri, (err, res) => {
      expect(res.statusCode).to.equal(200)
      done()
    })
  })

  it('Route matched, has correct headers', done => {
    request.get(uri, (err, res) => {
      expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
      expect(res.headers['cache-control']).to.equal(
        'max-age=60, must-revalidate, public'
      )
      done()
    })
  })

  // it('Preview routes send no-cache headers', done => {
  //   request.get(
  //     `${uri}/foo/bar/571?tapestry_hash=somesortofhash&p=571`,
  //     (err, res) => {
  //       expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
  //       expect(res.headers['cache-control']).to.equal('no-cache')
  //       done()
  //     }
  //   )
  // })

  it('Route not matched, status code is 404', done => {
    request.get(`${uri}/route/not/matched/in/any/way`, (err, res) => {
      expect(res.statusCode).to.equal(404)
      done()
    })
  })

  it('Route matched, API 404, status code is 404', done => {
    request.get(`${uri}/404-response`, (err, res) => {
      expect(res.statusCode).to.equal(404)
      done()
    })
  })

  it('Route matched, multiple API requests, status code is 200', done => {
    request.get(`${uri}/object-endpoint`, (err, res) => {
      expect(res.statusCode).to.equal(200)
      done()
    })
  })

  it('Route matched, API empty response, status code is 404', done => {
    request.get(`${uri}/empty-response`, (err, res) => {
      expect(res.statusCode).to.equal(404)
      done()
    })
  })

  it('Static route matched, no data loaded, status code is 200', done => {
    request.get(`${uri}/static-endpoint`, (err, res) => {
      expect(res.statusCode).to.equal(200)
      done()
    })
  })

  it('Route matched, array API 404, status code is 404', done => {
    request.get(`${uri}/array-endpoint-error`, (err, res) => {
      expect(res.statusCode).to.equal(404)
      done()
    })
  })

  it('Route matched, object API 404, status code is 404', done => {
    request.get(`${uri}/object-endpoint-error`, (err, res) => {
      expect(res.statusCode).to.equal(404)
      done()
    })
  })
})
