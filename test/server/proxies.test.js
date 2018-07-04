import { expect } from 'chai'
import request from 'request'
import nock from 'nock'
import posts from '../mocks/posts.json'

import Server, { registerPlugins } from '../../src/server'

describe('Handling static proxies', () => {
  let server = null
  let uri = null
  let proxyPath = '/robots.txt'
  let proxyContents = 'Test file'
  let config = {
    proxyPaths: [proxyPath],
    siteUrl: 'http://dummy.api',
    components: {}
  }

  before(async () => {
    // mock api response
    nock('http://dummy.api')
      .get(proxyPath)
      .reply(200, proxyContents)
      .get('/wp-json/wp/v2/pages?slug=test.txt&_embed')
      .reply(404, { data: { status: 404 } })
    // boot tapestry server
    server = new Server({ config })
    await registerPlugins({ config, server })
    await server.start()
    uri = server.info.uri
  })

  after(async () => await server.stop())

  it('Proxy should return correct content', done => {
    request.get(uri + proxyPath, (err, res, body) => {
      expect(body).to.contain(proxyContents)
      done()
    })
  })
})

describe('Handling wildcard proxies', () => {
  let server = null
  let uri = null
  let proxyPath = '/sitemap/{sitemapId}'
  let proxyContents = 'Test file'
  let config = {
    proxyPaths: [
      proxyPath,
      { '/test/{something}': 'http://test.proxy/test/hello.xml' }
    ],
    siteUrl: 'http://dummy.api',
    components: {}
  }

  before(async () => {
    // mock api response
    nock('http://dummy.api')
      .get('/sitemap/test.xml')
      .reply(200, proxyContents)
      .get('/sitemap/different-id.xml')
      .reply(200, proxyContents)
    nock('http://test.proxy')
      .get('/test/hello.xml')
      .reply(200, proxyContents)
    // boot tapestry server
    server = new Server({ config })
    await registerPlugins({ config, server })
    await server.start()
    uri = server.info.uri
  })

  after(async () => await server.stop())

  it('Proxy should return correct content from test a', done => {
    request.get(uri + '/sitemap/test.xml', (err, res, body) => {
      expect(body).to.contain(proxyContents)
      done()
    })
  })

  it('Proxy should return correct content from test b', done => {
    request.get(uri + '/sitemap/different-id.xml', (err, res, body) => {
      expect(body).to.contain(proxyContents)
      done()
    })
  })

  it('Proxy should return correct content from object syntax', done => {
    request.get(uri + '/test/hello', (err, res, body) => {
      expect(body).to.contain(proxyContents)
      done()
    })
  })
})

describe('Handling API proxy', () => {
  let server = null
  let uri = null
  let config = {
    siteUrl: 'http://dummy.api',
    components: {}
  }

  before(async () => {
    // mock api response
    nock('http://dummy.api')
      .get('/wp-json/wp/v2/posts')
      .reply(200, posts)
    // boot tapestry server
    server = new Server({ config })
    await registerPlugins({ config, server })
    await server.start()
    uri = server.info.uri
  })

  after(async () => await server.stop())

  it('API proxy should return correct content', done => {
    request.get(uri + '/api/v1/posts', (err, res, body) => {
      // console.log({body})
      expect(body).to.contain(JSON.stringify(posts.data))
      done()
    })
  })
})
