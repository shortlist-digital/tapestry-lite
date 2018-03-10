import React from 'react'
import { expect } from 'chai'
import request from 'request'
import nock from 'nock'

import TapestryLite from '../../src/server/server'
import dataPage from '../mocks/page.json'
import dataPost from '../mocks/post.json'
import dataPages from '../mocks/pages.json'
import dataPosts from '../mocks/posts.json'

const prepareJson = data =>
  JSON.stringify(data)
    .replace(/\//g, '\\/')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

describe('Handling custom static routes', () => {
  let server = null
  let uri = null
  let config = {
    routes: [
      {
        path: '/static-route',
        exact: true,
        component: () => <p>Static route</p>
      },
      {
        path: '/static-route/:custom',
        exact: true,
        component: props => <p>Param: {props.params.custom}</p>
      }
    ],
    siteUrl: 'http://routing-dummy.api'
  }

  before(async () => {
    // boot server server
    server = new TapestryLite({config: config})
    await server.start()
    uri = server.info.uri
  })

  after(async () => await server.stop())

  it('Route matched, render component', done => {
    request.get(`${uri}/static-route`, (err, res, body) => {
      expect(body).to.contain('Static route')
      done()
    })
  })

  it('Route matched, params available in component', done => {
    request.get(`${uri}/static-route/dynamic-parameter`, (err, res, body) => {
      expect(body).to.contain('dynamic-parameter')
      done()
    })
  })
})

describe('Handling custom endpoint routes', () => {
  let server = null
  let uri = null
  let config = {
    routes: [
      {
        path: '/string-endpoint',
        endpoint: () => 'pages',
        component: () => <p>Basic endpoint</p>
      },
      {
        path: '/dynamic-string-endpoint/:custom',
        endpoint: params => `pages?slug=${params.custom}`,
        component: () => <p>Custom endpoint</p>
      }
    ],
    siteUrl: 'http://routing-dummy.api'
  }

  before(async () => {
    // mock api response
    nock('http://routing-dummy.api')
      .get('/wp-json/wp/v2/pages')
      .times(5)
      .reply(200, dataPages.data)
      .get('/wp-json/wp/v2/posts')
      .times(5)
      .reply(200, dataPosts.data)
      .get('/wp-json/wp/v2/posts?slug=test')
      .times(5)
      .reply(200, dataPost)
      .get('/wp-json/wp/v2/pages?slug=test')
      .times(5)
      .reply(200, dataPage)
    // boot server server
    server = new TapestryLite({config: config})
    await server.start()
    uri = server.info.uri
  })

 after(async () => await server.stop())

  it('Route matched, string endpoint works', done => {
    request.get(`${uri}/string-endpoint`, (err, res, body) => {
      expect(body).to.contain(prepareJson(dataPages.data))
      done()
    })
  })

  it('Route matched, dynamic string endpoint works', done => {
    request.get(`${uri}/dynamic-string-endpoint/test`, (err, res, body) => {
      expect(body).to.contain(prepareJson(dataPage))
      done()
    })
  })
})

