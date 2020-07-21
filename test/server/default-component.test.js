import React from 'react'
import { expect } from 'chai'
import request from 'request'
import nock from 'nock'

import Server from '../../src/server'
import dataPost from '../mocks/post.json'
import dataPosts from '../mocks/posts.json'
import dataPage from '../mocks/page.json'

describe('Default view rendering', () => {
  let server = null
  let uri = null
  let config = {
    components: {
      Category: () => <p>Category component</p>,
      Post: () => <p>Post component</p>,
      Page: () => <p>Page component</p>,
      FrontPage: () => <p>FrontPage component</p>
    },
    siteUrl: 'http://dummy.api'
  }

  before(async () => {
    // mock api response
    nock('http://dummy.api')
      .get('/wp-json/wp/v2/posts?_embed')
      .reply(200, dataPosts.data)
      .get('/wp-json/wp/v2/pages?slug=slug&_embed')
      .reply(200, dataPage)
      .get('/wp-json/wp/v2/posts?filter[category_name]=test&_embed')
      .reply(200, dataPosts.data)
      .get('/wp-json/wp/v2/posts?slug=slug&_embed')
      .reply(200, dataPost)
    // boot  server
    server = new Server({ config: config })
    process.env.DISABLE_CACHE = true
    await server.start()
    uri = server.info.uri
  })

  after(async () => await server.stop())

  it('Default FrontPage is rendered', done => {
    request(uri, (err, res, body) => {
      console.log('lulbody', body)
      expect(body).to.contain('FrontPage component')
      done()
    })
  })

  it('Default Category is rendered', done => {
    request(`${uri}/category/test`, (err, res, body) => {
      expect(body).to.contain('Category component')
      done()
    })
  })

  it('Default Page is rendered', done => {
    request(`${uri}/slug`, (err, res, body) => {
      expect(body).to.contain('Page component')
      done()
    })
  })

  it('Default Post is rendered', done => {
    request(`${uri}/year/month/day/slug`, (err, res, body) => {
      expect(body).to.contain('Post component')
      done()
    })
  })
})
