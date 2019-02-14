import React from 'react'
import { expect } from 'chai'
import request from 'request'
import nock from 'nock'

import CacheManager from '../../src/server/utilities/cache-manager'
import Server from '../../src/server'
import dataPost from '../mocks/post.json'
import dataPosts from '../mocks/posts.json'
import dataPage from '../mocks/page.json'
import dataPages from '../mocks/pages.json'

describe('Handling cache purges', () => {
  let server = null
  let uri = null
  let config = {
    routes: [
      {
        path: '/',
        endpoint: 'pages',
        component: () => <p>Basic endpoint</p>
      },
      {
        path: '/string-endpoint',
        endpoint: 'pages',
        component: () => <p>Basic endpoint</p>
      },
      {
        path: '/dynamic-string-endpoint/:custom',
        endpoint: params => `pages?slug=${params.custom}`,
        component: () => <p>Custom endpoint</p>
      },
      {
        path: '/multiple-endpoint',
        endpoint: ['pages', 'pages?slug=test'],
        component: () => <p>Multi endpoint</p>
      }
    ],
    siteUrl: 'http://dummy.api'
  }

  const cacheManager = new CacheManager()

  beforeEach(async () => {
    // mock api response
    nock('http://dummy.api')
      .get('/wp-json/wp/v2/pages')
      .times(4)
      .reply(200, dataPages.data)
      .get('/wp-json/wp/v2/pages?slug=test')
      .times(4)
      .reply(200, dataPage)
    // boot tapestry server
    server = new Server({ config })
    await server.start()
    uri = server.info.uri
  })

  afterEach(async () => await server.stop())

  it('String endpoint is purgeable', done => {
    const route = 'string-endpoint'
    const purgeResp = { status: `Purged ${route}` }

    request.get(`${uri}/${route}`, async (err, res, body) => {
      expect(body).to.contain('Basic endpoint')
      expect(res.statusCode).to.equal(200)
      const cacheApi = cacheManager.getCache('html')
      const result = await cacheApi.get(route)
      expect(result).to.exist

      request.get(`${uri}/purge/${route}`, async (err, res, body) => {
        const cacheApi = cacheManager.getCache('html')
        expect(body).to.contain(JSON.stringify(purgeResp))
        expect(res.statusCode).to.equal(200)
        const result = await cacheApi.get(route)
        expect(result).to.not.exist
        done()
      })
    })
  })

  it('Home route is purgeable', done => {
    const route = '/'
    const purgeResp = { status: `Purged ${route}` }

    request.get(`${uri}`, (err, res, body) => {
      expect(body).to.contain('Basic endpoint')
      expect(res.statusCode).to.equal(200)

      request.get(`${uri}/purge/${route}`, async (err, res, body) => {
        const cacheApi = cacheManager.getCache('html')
        expect(body).to.contain(JSON.stringify(purgeResp))
        expect(res.statusCode).to.equal(200)
        const result = await cacheApi.get('pages')
        expect(result).to.not.exist

        done()
      })
    })
  })
})

describe('Handling cache set/get', () => {
  let server = null
  let uri = null
  let config = {
    components: {
      FrontPage: () => <p>Hello</p>,
      Post: () => <p>Hello</p>
    },
    siteUrl: 'http://dummy.api'
  }

  const cacheManager = new CacheManager()

  before(async () => {
    process.env.CACHE_MAX_AGE = 60 * 1000
    process.env.CACHE_MAX_ITEM_COUNT = 2
    // mock api response
    nock('http://dummy.api')
      .get('/wp-json/wp/v2/posts?_embed')
      .times(2)
      .reply(200, dataPosts.data)
      .get('/wp-json/wp/v2/posts?slug=test&_embed')
      .times(2)
      .reply(200, dataPost)
      .get('/wp-json/wp/v2/posts?slug=item-one&_embed')
      .reply(200, dataPost)
      .get('/wp-json/wp/v2/posts?slug=item-two&_embed')
      .reply(200, dataPost)
      .get('/wp-json/wp/v2/posts?slug=item-three&_embed')
      .reply(200, dataPost)
      .get('/wp-json/wp/v2/posts?slug=query-test&_embed')
      .reply(200, dataPost)
    // boot tapestry server
    server = new Server({ config })
    await server.start()
    uri = server.info.uri
  })

  after(async () => {
    delete process.env.CACHE_MAX_AGE
    delete process.env.CACHE_MAX_ITEM_COUNT
    await server.stop()
  })

  it('Sets HTML cache items correctly', done => {
    request.get(uri, async (err, res, body) => {
      const cacheHtml = cacheManager.getCache('html')
      const cacheString = await cacheHtml.get('/')
      const cacheObject = JSON.parse(cacheString)
      expect(cacheObject.responseString)
        .to.be.a('string')
        .that.includes('doctype')
      done()
    })
  })

  it('Sets API/HTML cache items without query string', done => {
    request.get(
      `${uri}/2017/12/01/query-test?utm_source=stop-it`,
      async (err, res, body) => {
        const cacheHtml = cacheManager.getCache('html')
        const shouldCacheString = await cacheHtml.get('2017/12/01/query-test')
        const shouldCache = JSON.parse(shouldCacheString)
        const shouldNotCache = await cacheHtml.get(
          '2017/12/01/query-test?utm_source=stop-it'
        )
        expect(shouldCache.responseString)
          .to.be.a('string')
          .that.includes('doctype')
        expect(shouldNotCache).to.not.exist
        done()
      }
    )
  })

  it('Doesnt set API/HTML cache items if preview', done => {
    request.get(
      `${uri}/2017/12/01/preview-test?tapestry_hash=123`,
      async (err, res, body) => {
        const cacheHtml = cacheManager.getCache('html')
        const shouldNotCache = await cacheHtml.get('2017/12/01/preview-test')
        expect(shouldNotCache).to.not.exist
        done()
      }
    )
  })

  it('Retrieves HTML cache items correctly', done => {
    const cacheHtml = cacheManager.getCache('html')
    const response = 'test string'
    cacheHtml.set(
      '2018/01/01/test',
      JSON.stringify({ responseString: response, status: 200 })
    )
    request.get(`${uri}/2018/01/01/test`, (err, res, body) => {
      expect(body).to.equal(response)
      done()
    })
  })

  // Redis doens't have a max items limit
  if (!process.env.REDIS_URL) {
    it('Sets max cache items correctly', done => {
      const cacheHtml = cacheManager.getCache('html')
      cacheHtml.reset()

      request.get(`${uri}/2017/12/01/item-one`, async () => {
        expect(await cacheHtml.keys()).to.have.length(1)
        request.get(`${uri}/2017/12/01/item-two`, async () => {
          expect(await cacheHtml.keys()).to.have.length(2)
          request.get(`${uri}/2017/12/01/item-three`, async () => {
            expect(await cacheHtml.keys()).to.have.length(2)
            expect(await cacheHtml.keys()).to.not.include('2017/12/01/one-item')
            done()
          })
        })
      })
    })
  }
})
